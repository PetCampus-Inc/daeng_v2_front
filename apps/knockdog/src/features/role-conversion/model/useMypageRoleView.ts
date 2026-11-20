'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { useIsOwnerVerified } from './useIsOwnerVerified';
import { useMypageRoleViewStore } from './mypageRoleViewStore';
import { useOwnerMypageSummary } from './useOwnerMypageSummary';
import { useOwnerRole } from './useOwnerRole';

function useMypageRoleView() {
  const { isOwner: isOwnerVerified, isResolved: isOwnerRoleResolved, isFetching } = useOwnerRole();
  const prefersGuardianView = useMypageRoleViewStore((state) => state.prefersGuardianView);
  const setPrefersGuardianView = useMypageRoleViewStore((state) => state.setPrefersGuardianView);
  const resetPrefersGuardianView = useMypageRoleViewStore((state) => state.resetPrefersGuardianView);
  const { canSwitchToGuardian } = useOwnerMypageSummary();

  useEffect(() => {
    // 원장 권한 조회 전에는 isOwner가 false다. 이 시점에 초기화하면
    // localStorage에 저장한 마지막 보호자 화면 선택이 매 진입마다 사라진다.
    if (isOwnerRoleResolved && !isFetching && !isOwnerVerified) {
      resetPrefersGuardianView();
    }
  }, [isFetching, isOwnerRoleResolved, isOwnerVerified, resetPrefersGuardianView]);

  const canToggleRoleView = isOwnerVerified && canSwitchToGuardian;
  const isOwnerView = isOwnerVerified && (!canToggleRoleView || !prefersGuardianView);
  const isGuardianView = !isOwnerView;

  const setRoleView = (mode: 'owner' | 'guardian') => {
    setPrefersGuardianView(mode === 'guardian');
  };

  return {
    isOwnerView,
    isGuardianView,
    canToggleRoleView,
    setRoleView,
  };
}

function isGuardianMainPath(pathname: string) {
  return (
    pathname === '/' ||
    pathname === '/search' ||
    pathname === '/save' ||
    pathname === '/reservation' ||
    pathname === '/kindergarten' ||
    pathname.startsWith('/save/')
  );
}

function isOwnerMainPath(pathname: string) {
  return pathname === '/owner' || pathname.startsWith('/owner/');
}

function useShowOwnerBottomNav() {
  const pathname = usePathname();
  const isOwnerVerified = useIsOwnerVerified();
  const prefersGuardianView = useMypageRoleViewStore((state) => state.prefersGuardianView);

  if (isGuardianMainPath(pathname)) return false;
  if (isOwnerMainPath(pathname)) return isOwnerVerified;

  return isOwnerVerified && !prefersGuardianView;
}

export { useMypageRoleView, useShowOwnerBottomNav };
