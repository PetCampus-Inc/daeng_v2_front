import { useEffect, useState } from 'react';
import { LoaderOptions, NaverMapLoader } from '../utils/NaverMapLoader';

export const useNaverLoader = (options: LoaderOptions) => {
  const [state, setState] = useState<[loading: boolean, error: Error | ErrorEvent | undefined]>([
    true,
    undefined,
  ]);

  useEffect(
    () => {
      let cancelled = false;
      setState([true, undefined]);
      try {
        new NaverMapLoader({ ...options })
          .load()
          .then(() => {
            if (cancelled) return;
            setState([false, undefined]);
          })
          .catch((error: Error | ErrorEvent) => {
            if (cancelled) return;
            setState([false, error]);
          });
      } catch (error) {
        if (!cancelled) {
          setState([false, error instanceof Error ? error : new Error(String(error))]);
        }
      }
      return () => {
        cancelled = true;
      };
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options.clientId, options.url]
  );

  return state;
};
