import { createContext, useContext } from 'react';
import type { UseTooltipReturn } from './use-tooltip';

export type UseTooltipContext = UseTooltipReturn;

const TooltipContext = createContext<UseTooltipContext | null>(null);
TooltipContext.displayName = 'TooltipContext';

export const TooltipProvider = TooltipContext.Provider;

export function useTooltipContext(options?: { strict?: true }): UseTooltipContext;
export function useTooltipContext(options: { strict: false }): UseTooltipContext | null;

export function useTooltipContext(options?: { strict?: boolean }): UseTooltipContext | null {
  const strict = options?.strict ?? true;
  const ctx = useContext(TooltipContext);

  if (strict && !ctx) {
    throw new Error('useTooltipContext must be used within a TooltipProvider');
  }
  return ctx;
}
