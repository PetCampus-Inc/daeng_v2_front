type ViewportSize = Readonly<{ width: number; height: number }>;

export function getViewportSize(): ViewportSize {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}
