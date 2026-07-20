'use client';

import { useEffect } from 'react';

import { useIsOwnerVerified } from './useIsOwnerVerified';
import { useMypageRoleViewStore } from './mypageRoleViewStore';
import { useOwnerMypageSummary } from './useOwnerMypageSummary';

function useMypageRoleView() {
  const isOwnerVerified = useIsOwnerVerified();
  const prefersGuardianView = useMypageRoleViewStore((state) => state.prefersGuardianView);
  const togglePrefersGuardianView = useMypageRoleViewStore((state) => state.togglePrefersGuardianView);
  const resetPrefersGuardianView = useMypageRoleViewStore((state) => state.resetPrefersGuardianView);
  const { canSwitchToGuardian } = useOwnerMypageSummary();

  useEffect(() => {
    if (!isOwnerVerified) {
      resetPrefersGuardianView();
    }
  }, [isOwnerVerified, resetPrefersGuardianView]);

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

function useShowOwnerBottomNav() {
  const isOwnerVerified = useIsOwnerVerified();
  const prefersGuardianView = useMypageRoleViewStore((state) => state.prefersGuardianView);

  return isOwnerVerified && !prefersGuardianView;
}

export { useMypageRoleView, useShowOwnerBottomNav };
