/**
 * 게스트 둘러보기 노출 여부.
 * 기본 숨김(웹/네이티브 웹뷰 공통). 개발 시에만 `apps/knockdog/.env` 에 다음을 추가
 * NEXT_PUBLIC_ENABLE_GUEST_LOGIN=true
 */
function isGuestLoginEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_GUEST_LOGIN === 'true';
}

export { isGuestLoginEnabled };
