'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import {
  SOCIAL_PROVIDER,
  SocialProvider,
  SocialUser,
  VERIFY_OIDC_RESULT_CODE,
  fetchLinkedSocialUser,
  postVerifyOidc,
  useSocialUserStore,
} from '@entities/social-user';
import { USER_STATUS, useUserStore, User } from '@entities/user';
import { LOGIN_ERROR_CODE, ApiError, ApiResponse, postLogin } from '@shared/api';
import { STORAGE_KEYS } from '@shared/constants';
import { TypedStorage } from '@shared/lib';
import { route } from '@shared/constants/route';
import { useBridge, useStackNavigation } from '@shared/lib/bridge';
import { METHODS, SocialLoginResult } from '@knockdog/bridge-core';

const SOCIAL_LOGIN_METHOD_MAP = {
  [SOCIAL_PROVIDER.KAKAO]: METHODS.kakaoLogin,
  [SOCIAL_PROVIDER.GOOGLE]: METHODS.googleLogin,
  [SOCIAL_PROVIDER.APPLE]: METHODS.appleLogin,
} as const;

export const useLogin = () => {
  const { push, back } = useStackNavigation();
  const bridge = useBridge();

  const { mutate: loginMutate } = useMutation<ApiResponse<User>>({ mutationFn: postLogin });
  const { mutateAsync: oidcMutateAsync } = useMutation({ mutationFn: postVerifyOidc });

  const setUser = useUserStore((state) => state.setUser);
  const setSocialUser = useSocialUserStore((state) => state.setSocialUser);

  const linkedSocialUser = new TypedStorage<SocialUser | null>(STORAGE_KEYS.LINKED_SOCIAL_USER, { initialValue: null });

  /** OIDC 인증 */
  const oidcAuth = async (provider: SocialProvider) => {
    const response = await bridge.request<SocialLoginResult>(SOCIAL_LOGIN_METHOD_MAP[provider], undefined, {
      timeoutMs: 120_000,
    });

    // OIDC 검증 요청 (IDToken)
    const { code } = await oidcMutateAsync({ provider, ...response }, { onSuccess: ({ data }) => setSocialUser(data) });

    return code;
  };

  const handleLoginSuccess = (data: User) => {
    if (data.status === USER_STATUS.ACTIVE) {
      setUser(data);

      // TODO: 네이티브일 경우 로그인 스택 pop, 웹일 경우 이전 페이지로 돌아가도록 수정할 것
      back();
    }
  };

  const handleLoginError = (error: Error) => {
    const apiError = error as ApiError;

    // 탈퇴한 유저 (재가입 제한 기간 이후)
    if (apiError.code === LOGIN_ERROR_CODE.WITHDRAWN_USER) push({ pathname: route.auth.register.location.root });
    // 재가입 제한 기간 이내
    else if (apiError.code === LOGIN_ERROR_CODE.REJOINING_RESTRICTION_PERIOD)
      push({ pathname: route.auth.rejoinBlocked.root });
  };

  /** 로그인 */
  const login = async (provider: SocialProvider) => {
    const code = await oidcAuth(provider);

    // OIDC 인증 성공
    if (code === VERIFY_OIDC_RESULT_CODE.SUCCESS) {
      loginMutate(undefined, {
        onSuccess: ({ data }) => handleLoginSuccess(data),
        onError: handleLoginError,
      });
    }

    // 연동되지 않은 계정 (회원가입 페이지로 이동)
    else if (code === VERIFY_OIDC_RESULT_CODE.UNLINKED) push({ pathname: route.auth.register.location.root });
    // 동일한 이메일의 계정이 존재 (연동된 소셜 계정 정보 저장 후 로그인 페이지로 이동)
    else if (code === VERIFY_OIDC_RESULT_CODE.EMAIL_ALREADY_EXISTS) {
      try {
        // 연동된 소셜 계정 정보 저장
        const response = await fetchLinkedSocialUser();
        linkedSocialUser.set(response.data);

        push({ pathname: route.auth.login.redirect.root });
      } catch (error) {
        // 연동된 소셜 계정 정보 조회 실패 시 로그인 페이지로 이동
        console.error('알 수 없는 오류가 발생했습니다.', error);

        push({ pathname: route.auth.login.root });
      }
    }

    // TODO: VERIFY_OIDC_RESULT_CODE 예외 처리 필요
  };

  return { login };
};
