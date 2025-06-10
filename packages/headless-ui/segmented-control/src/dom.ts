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

const itemMap = new Map<string, HTMLElement>();

export const getItemElement = (rootEl: HTMLElement | null, value: string) => {
  if (!rootEl || !value) return null;

  const cachedEl = itemMap.get(value);
  if (
    cachedEl &&
    rootEl.contains(cachedEl) &&
    cachedEl.getAttribute('data-state') === 'checked'
  ) {
    return cachedEl;
  }

  const element = rootEl.querySelector(
    `[data-value="${value}"][data-state="checked"]`
  ) as HTMLElement | null;

  if (element) {
    itemMap.set(value, element);
  } else {
    itemMap.delete(value);
  }

  return element;
};

export const clearItemCache = () => {
  itemMap.clear();
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

export const dataAttr = (guard: boolean | undefined) =>
  (guard ? '' : undefined) as boolean | 'true' | 'false';

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
