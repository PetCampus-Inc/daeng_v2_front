/**
 * 게스트 둘러보기 노출 여부.
 * 기본 숨김(웹/네이티브 웹뷰 공통). 개발 시에만 `apps/knockdog/.env.development`에 설정:
 * NEXT_PUBLIC_ENABLE_GUEST_LOGIN=true
 *
 * (.env / .env.local 은 production 빌드에도 포함될 수 있어 사용하지 않음)
 */
function isGuestLoginEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_GUEST_LOGIN === 'true';
}

export { isGuestLoginEnabled };
