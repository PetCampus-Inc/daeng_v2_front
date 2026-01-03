import { createSafeContext } from '@shared/lib';
import { useMemo, useState, type ReactNode } from 'react';

interface DisplayFilterContextValue {
  isOnlyBookmarked: boolean;
  isOnlyMemoed: boolean;
  setOnlyBookmarked: (value: boolean) => void;
  setOnlyMemoed: (value: boolean) => void;
  toggleBookmarked: () => void;
  toggleMemoed: () => void;
  isFilterActive: boolean;
}

const [DisplayFilterContext, useDisplayFilterContext] =
  createSafeContext<DisplayFilterContextValue>('DisplayFilterContext');

export function DisplayFilterProviderImpl({ children }: { children: ReactNode }) {
  const [isOnlyBookmarked, setOnlyBookmarked] = useState(false);
  const [isOnlyMemoed, setOnlyMemoed] = useState(false);

  const toggleBookmarked = () => setOnlyBookmarked((prev) => !prev);
  const toggleMemoed = () => setOnlyMemoed((prev) => !prev);

  const isFilterActive = isOnlyBookmarked || isOnlyMemoed;

  const value = useMemo(
    () => ({
      isOnlyBookmarked,
      isOnlyMemoed,
      setOnlyBookmarked,
      setOnlyMemoed,
      toggleBookmarked,
      toggleMemoed,
      isFilterActive,
    }),
    [isOnlyBookmarked, isOnlyMemoed]
  );

  return <DisplayFilterContext value={value}>{children}</DisplayFilterContext>;
}

export { DisplayFilterProviderImpl as DisplayFilterProvider, useDisplayFilterContext };
