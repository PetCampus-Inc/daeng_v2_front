'use client';

import { useMutation } from '@tanstack/react-query';
import { METHODS, SocialLoginResult } from '@knockdog/bridge-core';

import {
  SOCIAL_PROVIDER,
  SocialProvider,
  SocialUser,
  VERIFY_OIDC_RESULT_CODE,
  fetchLinkedSocialUser,
  postVerifyOidc,
  useSocialUserStore,
} from '@entities/social-user';
import { postRegisterUser, USER_STATUS, useUserStore, User } from '@entities/user';
import { LOGIN_ERROR_CODE, ApiError, ApiResponse, postLogin, fetchDevLogin } from '@shared/api';
import { STORAGE_KEYS } from '@shared/constants';
import { TypedStorage } from '@shared/lib';
import { route } from '@shared/constants/route';
import { hasSeenDevicePermissionIntro } from '@shared/lib/auth/devicePermissionIntro';
import {
  clearPostSignUpRedirect,
  getInternalRedirect,
  savePostSignUpRedirect,
} from '@shared/lib/auth/postSignUpRedirect';
import {
  clearPendingSignUpAnalytics,
  resolveEntrySource,
  savePendingSignUpAnalytics,
  toSignUpMethod,
} from '@shared/lib/analytics';
import { useBridge, useStackNavigation, useNavigationResult, getCurrentTxId } from '@shared/lib/bridge';
import { isNativeWebView } from '@shared/lib/device';
import { toast } from '@shared/ui/toast';
import { HTTPError } from 'ky';

import { isSocialLoginCancelled } from '../lib/socialLoginCancelledError';
import { webSocialLogin } from '../lib/webSocialLogin';

const SOCIAL_LOGIN_METHOD_MAP = {
  [SOCIAL_PROVIDER.KAKAO]: METHODS.kakaoLogin,
  [SOCIAL_PROVIDER.GOOGLE]: METHODS.googleLogin,
  [SOCIAL_PROVIDER.APPLE]: METHODS.appleLogin,
} as const;

export const useLogin = (options?: { redirectTo?: string; resetToMainAfterSignUp?: boolean }) => {
  const { push, back, replace, reset } = useStackNavigation();
  const bridge = useBridge();
  const navResult = useNavigationResult<boolean>();

  const { mutate: loginMutate } = useMutation<ApiResponse<User>>({ mutationFn: postLogin });
  const { mutateAsync: oidcMutateAsync } = useMutation({ mutationFn: postVerifyOidc });

  const setUser = useUserStore((state) => state.setUser);
  const setSocialUser = useSocialUserStore((state) => state.setSocialUser);

  const linkedSocialUser = new TypedStorage<SocialUser | null>(STORAGE_KEYS.LINKED_SOCIAL_USER, { initialValue: null });

  const redirectTo = getInternalRedirect(options?.redirectTo);

  /** OIDC 인증 — 네이티브는 브릿지 SDK, 브라우저는 webSocialLogin */
  const oidcAuth = async (provider: SocialProvider) => {
    try {
      const response = isNativeWebView()
        ? await bridge.request<SocialLoginResult>(SOCIAL_LOGIN_METHOD_MAP[provider], undefined, {
            timeoutMs: 120_000,
          })
        : await webSocialLogin(provider);

      // OIDC 검증 요청 (IDToken)
      const { code } = await oidcMutateAsync(
        { provider, idToken: response.idToken, name: response.name, picture: response.picture },
        { onSuccess: ({ data }) => setSocialUser(data) }
      );

      return code;
    } catch (error) {
      // 사용자가 팝업/오버레이를 닫은 경우 — toast·에러 로그 없이 중단
      if (isSocialLoginCancelled(error)) throw error;

      console.error('[useLogin] OIDC 인증 실패:', error);
      toast({
        title: '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.',
        shape: 'square',
        position: 'top',
      });
      throw error;
    }
  };

  const handleLoginSuccess = (data: User, { isNewSignUp = false }: { isNewSignUp?: boolean } = {}) => {
    // BE가 200을 주더라도 status가 ACTIVE가 아니면 silent 진행 금지.
    // 정식 흐름에선 handleLoginError에서 잡히지만, dev/guest 라우트처럼
    // status 체크 없이 user를 그대로 반환하는 엔드포인트 대비 안전망.
    if (data.status !== USER_STATUS.ACTIVE) {
      console.error('[useLogin] 비-ACTIVE 유저 응답', { status: data.status });
      toast({
        title: '로그인할 수 없는 계정입니다. 잠시 후 다시 시도해주세요.',
        shape: 'square',
        position: 'top',
      });
      return;
    }

    setUser(data);

    const shouldResetToMain = isNewSignUp && options?.resetToMainAfterSignUp === true;

    // 신규 가입은 필수 약관 동의가 끝난 뒤에만 원래 진입 컨텍스트로 이동한다.
    if (isNewSignUp && redirectTo) {
      savePostSignUpRedirect(redirectTo);
    } else {
      clearPostSignUpRedirect();
    }

    const resultTxId = shouldResetToMain ? null : getCurrentTxId();

    if (!hasSeenDevicePermissionIntro()) {
      const query = {
        // 신규 가입자는 권한 안내를 마친 뒤 내 주변에서 필수 약관을 먼저 동의한다.
        // 이 시점에 redirectTo를 전달하면 약관 동의 전에 초대 흐름으로 이동하게 된다.
        ...(!isNewSignUp && redirectTo ? { redirectTo } : {}),
        ...(isNewSignUp ? { deferRequiredTerms: 'true' } : {}),
        ...(resultTxId ? { resume: 'stack', _txId: resultTxId } : {}),
      };
      const hasQuery = Object.keys(query).length > 0;

      // pushForResult 로그인: 탭 스택을 유지한 채 로그인 화면만 권한 안내로 교체
      if (resultTxId) {
        replace({
          pathname: route.auth.devicePermission.root,
          query,
        }).catch(() => undefined);
        return;
      }

      reset(route.auth.devicePermission.root, hasQuery ? query : undefined).catch(() => undefined);
      return;
    }

    if (isNewSignUp || shouldResetToMain) {
      reset(route.root).catch(() => undefined);
      return;
    }

    // redirectTo가 있으면 그쪽으로 이동한다. replace()로 params(redirectTo 등)만 실어 보낸
    // 호출도 params가 있으면 무조건 _txId가 생기기 때문에, resultTxId만 보고 판단하면
    // pushForResult가 아닌 호출까지 "결과 반환 흐름"으로 오인해 원래 이동해야 할 곳 대신
    // back()으로 빠져버린다 — 그래서 resultTxId 분기보다 먼저 확인한다.
    if (redirectTo) {
      replace({ pathname: redirectTo });
      return;
    }

    if (resultTxId) {
      navResult.send(true);
      // pushForResult(탭 위 Stack): back으로 복귀. auth-only면 wentBack=false → 홈 reset
      void back()
        .then((wentBack) => {
          if (wentBack === false) return reset(route.root);
          return undefined;
        })
        .catch(() => reset(route.root).catch(() => undefined));
      return;
    }

    // 게이트가 login으로 replace 한 경우 history가 비어 back()이 무반응/이탈함 → 홈으로 reset
    reset(route.root).catch(() => undefined);
  };

  const registerCurrentSocialUser = async () => {
    const socialUser = useSocialUserStore.getState().socialUser;
    if (!socialUser) {
      throw new Error('NO_SOCIAL_USER');
    }

    const { data } = await postRegisterUser({
      nickname: socialUser.name || socialUser.email.split('@')[0] || '보호자',
      profileImage: socialUser.picture || '',
      addresses: [],
    });

    return data;
  };

  const completeSignUp = async () => {
    try {
      const user = await registerCurrentSocialUser();
      handleLoginSuccess(user, { isNewSignUp: true });
    } catch (error) {
      console.error('[useLogin] 회원가입 실패:', error);
      toast({
        title: '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.',
        shape: 'square',
        position: 'top',
      });
    }
  };

  const handleLoginError = (error: Error) => {
    const apiError = error as ApiError;

    // 탈퇴한 유저 (재가입 제한 기간 이후) — 온보딩 없이 재가입만 진행
    if (apiError.code === LOGIN_ERROR_CODE.WITHDRAWN_USER) {
      completeSignUp();
      return;
    }

    // 재가입 제한 기간 이내
    if (apiError.code === LOGIN_ERROR_CODE.REJOINING_RESTRICTION_PERIOD) {
      push({ pathname: route.auth.rejoinBlocked.root });
    }
  };

  /** 로그인 */
  const login = async (provider: SocialProvider) => {
    const pendingAnalytics = {
      method: toSignUpMethod(provider),
      entry_source: resolveEntrySource(redirectTo),
    };

    let code: Awaited<ReturnType<typeof oidcAuth>> | undefined;
    try {
      code = await oidcAuth(provider);
    } catch {
      // oidcAuth 내부에서 사용자 안내 toast를 이미 노출함
      return;
    }

    // OIDC 인증 성공 — 기존 계정 로그인. pending이 남아 약관에서 sign_up 오발화되지 않게 제거
    if (code === VERIFY_OIDC_RESULT_CODE.SUCCESS) {
      clearPendingSignUpAnalytics();
      loginMutate(undefined, {
        onSuccess: ({ data }) => handleLoginSuccess(data),
        onError: (error) => {
          // 탈퇴 후 재가입 분기
          if ((error as ApiError).code === LOGIN_ERROR_CODE.WITHDRAWN_USER) {
            savePendingSignUpAnalytics(pendingAnalytics.method, pendingAnalytics.entry_source);
          }
          handleLoginError(error);
        },
      });
    }

    // 연동되지 않은 계정 — 온보딩 없이 회원가입만 진행
    else if (code === VERIFY_OIDC_RESULT_CODE.UNLINKED) {
      savePendingSignUpAnalytics(pendingAnalytics.method, pendingAnalytics.entry_source);
      completeSignUp();
    }
    // 동일한 이메일의 계정이 존재 (연동된 소셜 계정 정보 저장 후 로그인 페이지로 이동)
    else if (code === VERIFY_OIDC_RESULT_CODE.EMAIL_ALREADY_EXISTS) {
      clearPendingSignUpAnalytics();
      try {
        // 연동된 소셜 계정 정보 저장
        const response = await fetchLinkedSocialUser();
        linkedSocialUser.set(response.data);

        push({
          pathname: route.auth.login.redirect.root,
          params: { redirectTo },
        });
      } catch (error) {
        // 연동된 소셜 계정 정보 조회 실패 시 로그인 페이지로 이동
        console.error('알 수 없는 오류가 발생했습니다.', error);

        push({ pathname: route.auth.login.root });
      }
    }

    // TODO: VERIFY_OIDC_RESULT_CODE 예외 처리 필요
  };

  /** 게스트 로그인 (DEV) */
  const guestLogin = async () => {
    try {
      const response = await fetchDevLogin<User>();
      handleLoginSuccess(response.data);
    } catch (error) {
      // 원인 분기: HTTPError(status 포함) vs 네트워크/기타
      if (error instanceof HTTPError) {
        console.error('[useLogin] 게스트 로그인 HTTP 실패', {
          status: error.response.status,
          url: error.response.url,
          name: error.name,
        });
      } else {
        console.error('[useLogin] 게스트 로그인 실패(비 HTTP)', error);
      }
      toast({
        title: '게스트 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.',
        shape: 'square',
        position: 'top',
      });
    }
  };

  return { login, guestLogin };
};
