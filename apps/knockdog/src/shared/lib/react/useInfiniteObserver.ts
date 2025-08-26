import { useEffect } from 'react';

export function useInfiniteObserver(opts: {
  root: React.RefObject<HTMLElement | null>;
  target: React.RefObject<HTMLElement | null>;
  disabled?: boolean;
  onHit: () => void;
  rootMargin?: string;
  threshold?: number;
}) {
  const { root, target, disabled, onHit, rootMargin = '100px', threshold = 0.1 } = opts;

  useEffect(() => {
    const rootEl = root.current ?? null;
    const targetEl = target.current;
    if (!targetEl || disabled) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onHit();
      },
      { root: rootEl, rootMargin, threshold }
    );

    io.observe(targetEl);
    return () => io.disconnect();
  }, [root, target, disabled, onHit, rootMargin, threshold]);
}
