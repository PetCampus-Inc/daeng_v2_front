'use client';

import type { ReactNode } from 'react';
import { DelayedLoadingSpinner } from './DelayedLoadingSpinner';

interface PageContentLoadingProps {
  isLoading: boolean;
  children: ReactNode;
  className?: string;
}

/** Header/GNB 아래 콘텐츠 영역 중앙 스피너 */
function PageContentLoading({ isLoading, children, className }: PageContentLoadingProps) {
  if (isLoading) {
    return <DelayedLoadingSpinner isLoading={isLoading} layout='content' className={className} />;
  }

  return children;
}

export { PageContentLoading };
