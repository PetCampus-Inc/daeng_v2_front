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
  mypage: {
    /** 마이 페이지 */
    root: '/mypage',
    profile: {
      /** 원장 프로필 페이지 */
      root: '/mypage/profile',
      edit: {
        /** 원장 프로필 수정 페이지 */
        root: '/mypage/profile/edit',
      },
      location: {
        /** 내 장소 설정 페이지 */
        root: '/mypage/profile/location',
      },
    },
  },
  owner: {
    members: {
      /** 원장 구성원 페이지 */
      root: '/owner/members',
      approval: {
        /** 원장 구성원 연결 승인 대기 목록 페이지 */
        root: '/owner/members/approval',
      },
    },
  },
  roleConversion: {
    businessVerification: {
      /** 관리자 전환 - 사업자번호 인증 */
      root: '/role-conversion/business-verification',
    },
    kindergartenSearch: {
      /** 관리자 전환 - 유치원 검색 */
      root: '/role-conversion/kindergarten-search',
    },
    kindergartenRegister: {
      /** 관리자 전환 - 유치원 직접 등록 */
      root: '/role-conversion/kindergarten-register',
      address: {
        /** 관리자 전환 - 유치원 주소 검색 */
        root: '/role-conversion/kindergarten-register/address',
      },
    },
    kindergartenConfirm: {
      /** 관리자 전환 - 유치원 정보 확인 */
      root: '/role-conversion/kindergarten-confirm',
    },
    privacyConsent: {
      /** 관리자 전환 - 개인정보 수집·이용 동의 */
      root: '/role-conversion/privacy-consent',
    },
    complete: {
      /** 관리자 전환 - 원장 권한 인증 완료 */
      root: '/role-conversion/complete',
    },
    releasePermission: {
      /** 관리자 전환 - 원장 권한 해제 */
      root: '/role-conversion/release-permission',
      reason: {
        /** 관리자 전환 - 원장 권한 해제 사유 선택 */
        root: '/role-conversion/release-permission/reason',
      },
      verify: {
        /** 관리자 전환 - 원장 권한 해제 유치원명 확인 */
        root: '/role-conversion/release-permission/verify',
      },
    },
  },
};

export { route };
