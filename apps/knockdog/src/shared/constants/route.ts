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
    register: {
      location: {
        /** 프로필 - 장소 등록 페이지 */
        root: '/register/location',
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
  register: {
    location: {
      /** 장소 등록 페이지 */
      root: '/register/location',
      add: {
        /** 장소 검색/추가 페이지 */
        root: '/register/location-add',
      },
    },
    userNickname: {
      /** 닉네임 등록 페이지 */
      root: '/register/user-nickname',
    },
    pet: {
      /** 반려동물 등록 페이지 */
      root: '/register/pet',
      detail: {
        /** 반려동물 상세 등록 페이지 */
        root: '/register/pet/detail',
      },
      profile: {
        /** 반려동물 프로필 등록 페이지 */
        root: '/register/pet/profile',
      },
      relationship: {
        /** 반려동물 관계 등록 페이지 */
        root: '/register/pet/relationship',
      },
    },
    welcome: {
      /** 환영 페이지 */
      root: '/register/welcome',
    },
  },
};

export { route };
