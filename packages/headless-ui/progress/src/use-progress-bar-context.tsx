import { createContext, useContext } from 'react';
import type { UseProgressBarReturn } from './use-progress-bar';

export interface UseProgressBarContext extends UseProgressBarReturn {}

const ProgressBarContext = createContext<UseProgressBarContext | null>(null);

export const ProgressBarProvider = ProgressBarContext.Provider;

export function useProgressBarContext<T extends boolean | undefined = true>({
  strict = true,
}: { strict?: T } = {}): T extends false
  ? UseProgressBarContext | null
  : UseProgressBarContext {
  const context = useContext(ProgressBarContext);

  if (strict && !context) {
    throw new Error(
      'useProgressBarContext must be used within a ProgressBarProvider'
    );
  }

  return context as UseProgressBarContext;
}
