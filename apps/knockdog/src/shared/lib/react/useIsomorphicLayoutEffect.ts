import { useEffect, useLayoutEffect } from 'react';

/**
 * environment 기반으로 `useLayoutEffect` 또는 `useEffect`를 쓰도록 하는 hook
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
