'use client';

import { createContext, useContext } from 'react';

function createSafeContext<T>(displayName?: string) {
  const Context = createContext<T | null>(null);
  Context.displayName = displayName ?? 'SafeContext';

  const useSafeContext = () => {
    const context = useContext(Context);

    if (context === null) {
      const error = new Error(`[${Context.displayName}]: Provider not found.`);
      error.name = '[Error] Context';

      throw error;
    }

    return context;
  };

  return [Context.Provider, useSafeContext] as const;
}

export { createSafeContext };
