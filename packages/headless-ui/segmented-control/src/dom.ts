export const getOffsetRect = (el: HTMLElement | null) => ({
  left: el?.offsetLeft ?? 0,
  top: el?.offsetTop ?? 0,
  width: el?.offsetWidth ?? 0,
  height: el?.offsetHeight ?? 0,
});

export const resolveRect = (
  rect: Record<'width' | 'height' | 'left' | 'top', number>
) => ({
  width: `${rect.width}px`,
  height: `${rect.height}px`,
  left: `${rect.left}px`,
  top: `${rect.top}px`,
});

export const getItemElement = (rootEl: HTMLElement | null, value: string) => {
  if (!rootEl || !value) return null;

  // TODO: 인스턴스별 캐시 적용
  return rootEl.querySelector(
    `[data-value="${CSS.escape(value)}"][data-state="checked"]`
  ) as HTMLElement | null;
};

export const trackElementRect = (
  element: HTMLElement | null,
  onUpdate: (rect: Record<'width' | 'height' | 'left' | 'top', number>) => void
) => {
  if (!element) return () => {};

  const updateRect = () => {
    const rect = getOffsetRect(element);
    onUpdate(rect);
  };

  updateRect();

  const observer = new ResizeObserver(updateRect);
  observer.observe(element);

  if (element.parentElement) {
    observer.observe(element.parentElement);
  }

  return () => {
    observer.disconnect();
  };
};

export const visuallyHiddenStyle = {
  border: '0',
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: '0',
  position: 'absolute',
  width: '1px',
  whiteSpace: 'nowrap',
  wordWrap: 'normal',
} as const;
