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

  // hydrate 전 blank → CLS. 레이아웃 높이만 유지한다.
  if (!isMounted) {
    return <div className='flex min-h-0 flex-1' aria-busy='true' aria-hidden='true' />;
  }

  // 로그인이 안되어 있으면 아예 렌더링하지 않음 (API 호출 방지)
  if (!isAuthenticated) return null;

  return children;
}
