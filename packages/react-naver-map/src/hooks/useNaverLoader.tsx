import { useEffect, useState } from 'react';
import { LoaderOptions, NaverMapLoader } from '../utils/NaverMapLoader';

export const useNaverLoader = (options: LoaderOptions) => {
  const [state, setState] = useState<[loading: boolean, error: ErrorEvent | undefined]>([true, undefined]);

  useEffect(
    () => {
      let cancelled = false;
      setState([true, undefined]);
      new NaverMapLoader({ ...options })
        .load()
        .then(() => {
          if (cancelled) return;
          setState([false, undefined]);
        })
        .catch((error) => {
          if (cancelled) return;
          setState([false, error]);
        });
      return () => {
        cancelled = true;
      };
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options.clientId, options.url]
  );

  return state;
};
