'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import { useUserStore } from '@entities/user';
import { useOwnerRole } from '@features/role-conversion/model/useOwnerRole';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { PageError } from '@shared/ui/page-error';
import { useRequireAuth } from '@shared/ui/private-access';

interface OwnerAccessGuardProps {
  children: ReactNode;
}

function hasUserStoreHydrated() {
  return useUserStore.persist?.hasHydrated?.() ?? true;
}

function OwnerAccessGuard({ children }: OwnerAccessGuardProps) {
  const hasAuth = useRequireAuth();
  const {
    isOwner: isOwnerVerified,
    isResolved: isOwnerRoleResolved,
    isError: isOwnerRoleError,
    isFetching: isOwnerRoleFetching,
    refetch: refetchOwnerRole,
  } = useOwnerRole();
  const { replace } = useStackNavigation();
  const isRedirectingRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isUserStoreHydrated, setIsUserStoreHydrated] = useState(hasUserStoreHydrated);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const unsubscribe = useUserStore.persist?.onFinishHydration?.(() => {
      setIsUserStoreHydrated(true);
    });

    if (hasUserStoreHydrated()) {
      setIsUserStoreHydrated(true);
    }

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (
      !isMounted ||
      !isUserStoreHydrated ||
      !hasAuth ||
      isOwnerRoleError ||
      !isOwnerRoleResolved ||
      isOwnerVerified ||
      isRedirectingRef.current
    )
      return;

    isRedirectingRef.current = true;
    replace({ pathname: route.mypage.root }).finally(() => {
      isRedirectingRef.current = false;
    });
  }, [
    hasAuth,
    isMounted,
    isOwnerRoleError,
    isOwnerRoleResolved,
    isOwnerVerified,
    isUserStoreHydrated,
    replace,
  ]);

  if (!isMounted || !isUserStoreHydrated || !hasAuth) {
    return null;
  }

  if (isOwnerRoleError) {
    return <PageError layout='overlay' isRetrying={isOwnerRoleFetching} onRetry={() => void refetchOwnerRole()} />;
  }

  if (!isOwnerRoleResolved || !isOwnerVerified) return null;

  return children;
}

export { OwnerAccessGuard };
export type { OwnerAccessGuardProps };
