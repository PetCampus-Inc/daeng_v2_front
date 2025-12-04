'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '../model/useRequireAuth';

export function PrivateAccess({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useRequireAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 하이드레이션 에러 방지: 초기 렌더링에서는 항상 children을 반환
  if (!isMounted) {
    return children;
  }

  // 로그인이 안되어 있으면 아예 렌더링하지 않음 (API 호출 방지)
  if (!isAuthenticated) return null;

  return children;
}
