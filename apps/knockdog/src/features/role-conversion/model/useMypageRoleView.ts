'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { useIsOwnerVerified } from './useIsOwnerVerified';
import { useMypageRoleViewStore } from './mypageRoleViewStore';
import { useOwnerMypageSummary } from './useOwnerMypageSummary';
import { useOwnerRole } from './useOwnerRole';

function useMypageRoleView() {
  const { isOwner: isOwnerVerified, isResolved: isOwnerRoleResolved } = useOwnerRole();
  const prefersGuardianView = useMypageRoleViewStore((state) => state.prefersGuardianView);
  const togglePrefersGuardianView = useMypageRoleViewStore((state) => state.togglePrefersGuardianView);
  const resetPrefersGuardianView = useMypageRoleViewStore((state) => state.resetPrefersGuardianView);
  const { canSwitchToGuardian } = useOwnerMypageSummary();

  useEffect(() => {
    // 원장 권한 조회 전에는 isOwner가 false다. 이 시점에 초기화하면
    // localStorage에 저장한 마지막 보호자 화면 선택이 매 진입마다 사라진다.
    if (isOwnerRoleResolved && !isOwnerVerified) {
      resetPrefersGuardianView();
    }
  }, [isOwnerRoleResolved, isOwnerVerified, resetPrefersGuardianView]);

  const canToggleRoleView = isOwnerVerified && canSwitchToGuardian;
  const isOwnerView = isOwnerVerified && (!canToggleRoleView || !prefersGuardianView);
  const isGuardianView = !isOwnerView;

  const toggleRoleView = () => {
    if (!canToggleRoleView) return;

    togglePrefersGuardianView();
  };

  return {
    isOwnerView,
    isGuardianView,
    canToggleRoleView,
    toggleRoleView,
  };
}

function isGuardianMainPath(pathname: string) {
  return (
    pathname === '/' ||
    pathname === '/search' ||
    pathname === '/save' ||
    pathname === '/compare' ||
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
