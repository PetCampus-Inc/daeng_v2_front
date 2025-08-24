'use client';

import { useRouter } from 'next/navigation';

import { tempBridgeLogin } from '../lib';
import { useMutation } from '@tanstack/react-query';
import { SocialProvider, VERIFY_OIDC_RESULT_CODE, postVerifyOidc, useSocialUserStore } from '@entities/social';
import { USER_STATUS, useUserStore, User, postLogin } from '@entities/user';
import { API_ERROR_CODE, ApiError } from '@shared/lib';

export const useLogin = () => {
  const { push } = useRouter();

  const { mutate: loginMutate } = useMutation({ mutationFn: postLogin });
  const { mutateAsync: oidcMutateAsync } = useMutation({ mutationFn: postVerifyOidc });

  const setUser = useUserStore((state) => state.setUser);
  const setSocialUser = useSocialUserStore((state) => state.setSocialUser);

  /** OIDC 인증 */
  const oidcAuth = async (provider: SocialProvider) => {
    const response = await tempBridgeLogin(provider);

    const { code } = await oidcMutateAsync(
      { provider, ...response },
      {
        onSuccess: ({ data }) => setSocialUser(data),
      }
    );

    return code;
  };

  const handleLoginSuccess = (data: User) => {
    if (data.status === USER_STATUS.ACTIVE) {
      setUser(data);
      push('/');
    }
  };

  const handleLoginError = (error: Error) => {
    const apiError = error as ApiError;

    // 탈퇴한 유저 (재가입 제한 기간 이후)
    if (apiError.code === API_ERROR_CODE.WITHDRAWN_USER) push('/auth/signup');
    // 재가입 제한 기간 이내
    else if (apiError.code === API_ERROR_CODE.REJOINING_RESTRICTION_PERIOD) push('/auth/withdraw');
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
    // 연동되지 않은 계정 (회원가입)
    else if (code === VERIFY_OIDC_RESULT_CODE.UNLINKED) push('/profile/location');
    // 동일한 이메일의 계정이 존재
    else if (code === VERIFY_OIDC_RESULT_CODE.EMAIL_ALREADY_EXISTS) push('/auth/login/redirect');

    // TODO: VERIFY_OIDC_RESULT_CODE 예외 처리 필요
  };

  return { login };
};
