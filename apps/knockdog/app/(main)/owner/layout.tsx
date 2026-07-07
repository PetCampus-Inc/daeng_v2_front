'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useUserStore } from '@entities/user';
import { useIsOwnerVerified } from '@features/role-conversion';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { useRequireAuth } from '@shared/ui/private-access';

interface OwnerLayoutProps {
  children: ReactNode;
}

function hasUserStoreHydrated() {
  return useUserStore.persist?.hasHydrated?.() ?? true;
}

export default function Layout({ children }: OwnerLayoutProps) {
  const hasAuth = useRequireAuth();
  const isOwnerVerified = useIsOwnerVerified();
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
    if (!isMounted || !isUserStoreHydrated || !hasAuth || isOwnerVerified || isRedirectingRef.current) return;

    isRedirectingRef.current = true;
    replace({ pathname: route.mypage.root }).finally(() => {
      isRedirectingRef.current = false;
    });
  }, [hasAuth, isMounted, isOwnerVerified, isUserStoreHydrated, replace]);

  if (!isMounted || !isUserStoreHydrated || !hasAuth || !isOwnerVerified) {
    return null;
  }

  return children;
}
