import { useIsomorphicLayoutEffect } from '../utils/useIsomorphicLayoutEffect';

export const useNaverMapSetEffect = <T extends object, K extends keyof T>(
  target: T | undefined,
  method: K,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => {
  useIsomorphicLayoutEffect(() => {
    if (!target || args.every((arg) => typeof arg === 'undefined')) return;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line no-useless-call
    target[method].call(target, ...args);
  }, [target, method, ...args]);
};
