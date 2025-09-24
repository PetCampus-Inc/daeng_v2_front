const route = {
  /** 루트(메인) 페이지 */
  root: '/',
  auth: {
    login: {
      /** 로그인 페이지 */
      root: '/auth/login',
      /** 동일 이메일 리다이렉트 페이지 */
      redirect: {
        root: '/auth/login/redirect',
      },
    },
    profile: {
      location: {
        /** 프로필 - 장소 등록 페이지 */
        root: '/profile/location',
      },
    },
    reconnectSocial: {
      /** 계정 연동 확인 페이지 */
      root: '/auth/reconnect-social',
      /** 인증 메일 전송/확인 페이지 */
      verifyEmail: {
        root: '/auth/reconnect-social/verify-email',
      },
    },
    rejoinBlocked: {
      /** 재가입 제한 기간 페이지 */
      root: '/auth/rejoin-blocked',
    },
  },
};

export { route };
