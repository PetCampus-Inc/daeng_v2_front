/**
 * pathname → GA 화면명.
 * 동적 세그먼트는 RegExp로 매칭. `dynamic: true`면 페이지에서 제목 override 가능
 * (유치원명, 초대 유치원명 등).
 */
interface ScreenRoute {
  name: string;
  path?: string;
  /** 동적 경로 */
  pattern?: RegExp;
  /** 데이터가 로드되면 useScreenAnalyticsTitle로 이름을 덮어씀 */
  dynamic?: boolean;
}

const SCREEN_ROUTES: ScreenRoute[] = [
  { path: '/', name: '내 주변' },
  { path: '/open', name: '앱 오픈' },
  { path: '/search', name: '검색' },
  { path: '/save', name: '보관함' },
  { path: '/compare', name: '유치원' },
  { path: '/compare/connection-history', name: '연결 이력' },
  { path: '/compare/album', name: '보호자 앨범' },
  { path: '/compare/notice', name: '보호자 알림장' },
  { path: '/compare/notice/list', name: '보호자 알림장 목록' },
  { path: '/compare-complete', name: '비교 결과' },
  { path: '/notification', name: '알림함' },
  { path: '/alarm-setting', name: '알림 설정' },
  { path: '/terms', name: '약관' },
  { path: '/permission', name: '권한 안내' },

  { path: '/auth/login', name: '로그인' },
  { path: '/auth/login/redirect', name: '소셜 계정 연동 안내' },
  { path: '/auth/reconnect-social', name: '소셜 계정 재연동' },
  { path: '/auth/reconnect-social/verify-email', name: '소셜 재연동 메일 인증' },
  { path: '/auth/rejoin-blocked', name: '재가입 제한' },
  { path: '/auth/device-permission', name: '기기 권한 안내' },

  { path: '/register/welcome', name: '가입 환영' },
  { path: '/register/user-nickname', name: '닉네임 등록' },
  { path: '/register/location', name: '장소 등록' },
  { path: '/register/location-add', name: '장소 추가' },
  { path: '/register/pet', name: '반려동물 등록' },
  { path: '/register/pet/detail', name: '반려동물 상세 등록' },
  { path: '/register/pet/profile', name: '반려동물 프로필 등록' },
  { path: '/register/pet/relationship', name: '반려동물 관계 등록' },
  { path: '/register/marketing-consent', name: '마케팅 수신 동의' },

  { path: '/mypage', name: '마이페이지' },
  { path: '/mypage/profile', name: '원장 프로필' },
  { path: '/mypage/profile/edit', name: '원장 프로필 수정' },
  { path: '/mypage/profile/location', name: '내 장소 설정' },
  { path: '/mypage/profile/manage', name: '프로필 관리' },
  { path: '/mypage/guardian/profile', name: '보호자 프로필' },
  { path: '/mypage/kindergarten', name: '원장 유치원 정보' },
  { path: '/mypage/kindergarten/edit', name: '유치원 운영 정보 수정' },
  { path: '/mypage/kindergarten/edit/address', name: '유치원 주소 수정' },
  { path: '/mypage/kindergarten/edit/pricing', name: '유치원 요금 수정' },
  { path: '/mypage/pet-add', name: '강아지 프로필 추가' },
  { path: '/mypage/pet-detail', name: '강아지 프로필 상세' },
  { path: '/mypage/pet-edit', name: '강아지 프로필 수정' },

  { path: '/owner', name: '원장 홈' },
  { path: '/owner/daily', name: '일과' },
  { path: '/owner/album', name: '앨범' },
  { path: '/owner/members', name: '구성원' },
  { path: '/owner/members/approval', name: '연결 승인 대기' },

  { path: '/guardian/connection-apply/status', name: '연결 신청 현황' },

  { path: '/role-conversion/business-verification', name: '사업자번호 인증' },
  { path: '/role-conversion/kindergarten-search', name: '유치원 검색' },
  { path: '/role-conversion/kindergarten-register', name: '유치원 직접 등록' },
  { path: '/role-conversion/kindergarten-register/address', name: '유치원 주소 검색' },
  { path: '/role-conversion/kindergarten-confirm', name: '유치원 정보 확인' },
  { path: '/role-conversion/privacy-consent', name: '원장 전환 개인정보 동의' },
  { path: '/role-conversion/complete', name: '원장 권한 인증 완료' },
  { path: '/role-conversion/release-permission', name: '원장 권한 해제' },
  { path: '/role-conversion/release-permission/reason', name: '권한 해제 사유' },
  { path: '/role-conversion/release-permission/verify', name: '권한 해제 유치원 확인' },
  { path: '/role-conversion/release-permission/complete', name: '권한 해제 완료' },
  { path: '/role-conversion/release-permission/withdraw', name: '권한 해제 후 탈퇴' },

  { path: '/withdraw/confirm', name: '회원 탈퇴 확인' },
  { path: '/withdraw/survey', name: '회원 탈퇴 설문' },

  // 동적 경로 (긴 패턴 우선)
  {
    pattern: /^\/owner\/daily\/notice\/[^/]+\/template\/create$/,
    name: '알림장 템플릿 생성',
  },
  {
    pattern: /^\/owner\/daily\/notice\/[^/]+\/template\/[^/]+$/,
    name: '알림장 템플릿 상세',
  },
  {
    pattern: /^\/owner\/daily\/notice\/[^/]+\/template$/,
    name: '알림장 템플릿 목록',
  },
  { pattern: /^\/owner\/daily\/notice\/[^/]+$/, name: '알림장 작성' },
  { pattern: /^\/owner\/members\/[^/]+$/, name: '원생 프로필' },

  {
    pattern: /^\/kindergarten\/[^/]+\/report-info-update\/manual-address$/,
    name: '정보 수정 제보 주소',
  },
  {
    pattern: /^\/kindergarten\/[^/]+\/report-info-update$/,
    name: '정보 수정 제보',
  },
  { pattern: /^\/kindergarten\/[^/]+\/edit-memo$/, name: '유치원 메모 수정' },
  { pattern: /^\/kindergarten\/[^/]+$/, name: '유치원 상세', dynamic: true },
  { pattern: /^\/compare\/kindergarten\/[^/]+$/, name: '유치원 상세', dynamic: true },
  { pattern: /^\/company\/[^/]+\/edit-checklist$/, name: '체크리스트 수정' },
  { pattern: /^\/company\/[^/]+\/edit-memo$/, name: '메모 수정' },
  {
    pattern: /^\/company\/[^/]+\/report-info-update\/manual-address$/,
    name: '정보 수정 제보 주소',
  },
  { pattern: /^\/company\/[^/]+\/report-info-update$/, name: '정보 수정 제보' },
  { pattern: /^\/company\/[^/]+$/, name: '유치원 상세', dynamic: true },

  {
    pattern: /^\/invite\/guardian\/[^/]+\/complete$/,
    name: '보호자 초대 완료',
    dynamic: true,
  },
  {
    pattern: /^\/invite\/guardian\/[^/]+\/consent$/,
    name: '보호자 초대 동의',
  },
  {
    pattern: /^\/invite\/guardian\/[^/]+\/pet$/,
    name: '보호자 초대 강아지 선택',
  },
  {
    pattern: /^\/invite\/guardian\/[^/]+$/,
    name: '보호자 초대',
    dynamic: true,
  },

  { pattern: /^\/verify-email\/[^/]+$/, name: '메일 인증' },
];

function normalizePathname(pathname: string) {
  if (!pathname) return '/';
  const withoutQuery = pathname.split('?')[0] ?? pathname;
  if (withoutQuery.length > 1 && withoutQuery.endsWith('/')) {
    return withoutQuery.slice(0, -1);
  }
  return withoutQuery || '/';
}

function resolveScreenRoute(pathname: string): ScreenRoute | null {
  const path = normalizePathname(pathname);

  const exact = SCREEN_ROUTES.find((route) => route.path === path);
  if (exact) return exact;

  const patterned = SCREEN_ROUTES.find((route) => route.pattern?.test(path));
  return patterned ?? null;
}

function resolveScreenName(pathname: string): string | null {
  return resolveScreenRoute(pathname)?.name ?? null;
}

function isDynamicScreenPath(pathname: string): boolean {
  return resolveScreenRoute(pathname)?.dynamic === true;
}

export {
  normalizePathname,
  resolveScreenName,
  resolveScreenRoute,
  isDynamicScreenPath,
};
export type { ScreenRoute };
