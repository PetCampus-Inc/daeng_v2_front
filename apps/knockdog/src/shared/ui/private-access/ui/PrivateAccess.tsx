'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '../model/useRequireAuth';

interface PrivateAccessProps {
  children: React.ReactNode;
  onAuthError?: (error: Error) => void;
}

export function PrivateAccess({ children, onAuthError }: PrivateAccessProps) {
  const isAuthenticated = useRequireAuth(onAuthError);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 서버 false / 클라 토큰 true mismatch 방지. mount 후 한 프레임만 비움.
  if (!isMounted) return null;

  if (!isAuthenticated) return null;

  return children;
}
