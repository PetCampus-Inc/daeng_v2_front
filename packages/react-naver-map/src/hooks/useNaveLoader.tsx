import { useEffect, useState } from 'react';
import { LoaderOptions, NaverMapLoader } from '../utils/NaverMapLoader';

export const useNaveLoader = (options: LoaderOptions) => {
  const [state, setState] = useState<[loading: boolean, error: ErrorEvent | undefined]>([true, undefined]);

  useEffect(
    () => {
      new NaverMapLoader({ ...options })
        .load()
        .then(() => setState([false, undefined]))
        .catch((error) => {
          setState([false, error]);
        });
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(options)]
  );

  return state;
};
