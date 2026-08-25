/**
 * 미로그인 상태로 접근 가능한 경로
 * 그 외는 RequireAuthGate / useRequireAuth가 로그인으로 보냄
 */
function isPublicUnauthenticatedPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;

  const path = pathname.split('?')[0] || '/';

  if (path === '/open' || path.startsWith('/open/')) return true;
  if (path.startsWith('/auth/')) return true;
  // 초대 딥링크 → 기존 플로우에서 로그인으로 유도
  if (path.startsWith('/invite/')) return true;
  // 레거시 웹 랜딩
  if (path === '/permission' || path.startsWith('/permission/')) return true;

  return false;
}

/**
 * 네이티브에서 Tabs를 깔지 않고 Stack만 두는 인증 게이트 화면.
 * 뒤로가기로 비로그인 탭에 떨어지는 것을 막는다.
 */
function isAuthOnlyStackPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const path = pathname.split('?')[0] || '/';
  return (
    path === '/auth/login' ||
    path.startsWith('/auth/login/') ||
    path === '/auth/device-permission' ||
    path.startsWith('/auth/device-permission/') ||
    path.startsWith('/auth/rejoin-blocked') ||
    path.startsWith('/auth/reconnect-social')
  );
}

export { isAuthOnlyStackPath, isPublicUnauthenticatedPath };
