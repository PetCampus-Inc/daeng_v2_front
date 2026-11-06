import { createSafeContext } from '@shared/lib';
import { useMemo, useState, type ReactNode } from 'react';

interface DisplayFilterContextValue {
  isOnlyBookmarked: boolean;
  isOnlyMemoed: boolean;
  isOnlyVerified: boolean;
  setOnlyBookmarked: (value: boolean) => void;
  setOnlyMemoed: (value: boolean) => void;
  setOnlyVerified: (value: boolean) => void;
  toggleBookmarked: () => void;
  toggleMemoed: () => void;
  toggleVerified: () => void;
  isFilterActive: boolean;
}

const [DisplayFilterContext, useDisplayFilterContext] =
  createSafeContext<DisplayFilterContextValue>('DisplayFilterContext');

export function DisplayFilterProviderImpl({ children }: { children: ReactNode }) {
  const [isOnlyBookmarked, setOnlyBookmarked] = useState(false);
  const [isOnlyMemoed, setOnlyMemoed] = useState(false);
  const [isOnlyVerified, setOnlyVerified] = useState(false);

  const toggleBookmarked = () => setOnlyBookmarked((prev) => !prev);
  const toggleMemoed = () => setOnlyMemoed((prev) => !prev);
  const toggleVerified = () => setOnlyVerified((prev) => !prev);

  const isFilterActive = isOnlyBookmarked || isOnlyMemoed || isOnlyVerified;

  const value = useMemo(
    () => ({
      isOnlyBookmarked,
      isOnlyMemoed,
      isOnlyVerified,
      setOnlyBookmarked,
      setOnlyMemoed,
      setOnlyVerified,
      toggleBookmarked,
      toggleMemoed,
      toggleVerified,
      isFilterActive,
    }),
    [isOnlyBookmarked, isOnlyMemoed, isOnlyVerified]
  );

  return <DisplayFilterContext value={value}>{children}</DisplayFilterContext>;
}

export { DisplayFilterProviderImpl as DisplayFilterProvider, useDisplayFilterContext };
