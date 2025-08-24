import { createContext, useContext } from 'react';
import type { UseCheckboxReturn } from './use-checkbox';

export type UseCheckboxContext = UseCheckboxReturn;

const CheckboxContext = createContext<UseCheckboxContext | null>(null);
CheckboxContext.displayName = 'CheckboxContext';

export const CheckboxProvider = CheckboxContext.Provider;

export function useCheckboxContext(options?: { strict?: true }): UseCheckboxContext;
export function useCheckboxContext(options: { strict: false }): UseCheckboxContext | null;

export function useCheckboxContext(options?: { strict?: boolean }): UseCheckboxContext | null {
  const strict = options?.strict ?? true;
  const ctx = useContext(CheckboxContext);

  if (strict && !ctx) {
    throw new Error('useCheckboxContext must be used within a CheckboxProvider');
  }
  return ctx;
}
