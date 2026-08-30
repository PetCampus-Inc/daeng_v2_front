'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

import { useIsOwnerVerified } from './useIsOwnerVerified';
import { useMypageRoleViewStore } from './mypageRoleViewStore';
import { useOwnerMypageSummary } from './useOwnerMypageSummary';
import { useOwnerRole } from './useOwnerRole';

import { isNativeWebView } from '@shared/lib/device';

function useMypageRoleView() {
  const {
    isOwner: isOwnerVerified,
    isResolved: isOwnerRoleResolved,
    refetch: refetchOwnerRole,
  } = useOwnerRole();
  const hasRefetchedOnMount = useRef(false);
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

  useEffect(() => {
    if (!isNativeWebView()) return;

    const refetch = () => {
      void refetchOwnerRole();
    };

    // #627은 백그라운드 WebView의 동시 재조회를 막기 위해 전역 focus 재조회를 껐다.
    // 마이페이지는 역할 전환 이전 ownerRole=false 캐시를 보유할 수 있으므로, 이 탭이
    // 열리거나 활성화될 때만 명시적으로 재조회해 전환 버튼 노출 상태를 최신화한다.
    if (isOwnerRoleResolved && !hasRefetchedOnMount.current) {
      hasRefetchedOnMount.current = true;
      refetch();
    }

    window.addEventListener('knockdog:native-tab-focus', refetch);
    return () => {
      window.removeEventListener('knockdog:native-tab-focus', refetch);
    };
  }, [isOwnerRoleResolved, refetchOwnerRole]);

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
