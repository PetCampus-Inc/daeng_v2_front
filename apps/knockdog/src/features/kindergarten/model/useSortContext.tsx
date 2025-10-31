import { useState, ReactNode } from 'react';
import { createSafeContext } from '@shared/lib';

export type SortType = 'DISTANCE' | 'REVIEW';

interface SortContextValue {
  sortType: SortType;
  setSortType: (sortType: SortType) => void;
}

const [SortContext, useSort] = createSafeContext<SortContextValue>('SortContext');

export function SortContextImpl({ children }: { children: ReactNode }) {
  const [sortType, setSortType] = useState<SortType>('DISTANCE');

  return <SortContext value={{ sortType, setSortType }}>{children}</SortContext>;
}

export { SortContextImpl as SortContext, useSort };
