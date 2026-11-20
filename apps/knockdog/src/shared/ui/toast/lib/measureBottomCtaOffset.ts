import { BOTTOM_CTA_ATTRIBUTE, BOTTOM_NAV_ATTRIBUTE } from '@shared/constants';

/** CTA 영역 안에서 "버튼"으로 보는 요소. 디자인 간격(16px)은 영역이 아니라 버튼 윗면 기준이다. */
const CTA_BUTTON_SELECTOR = 'button, a[href], [role="button"]';

/**
 * 화면에 보이는 요소의 윗면 위치(px)를 돌려준다. 높이가 0이거나 화면 아래로 밀려난 요소는 null.
 */
const getVisibleTop = (element: Element, viewportHeight: number): number | null => {
  const rect = element.getBoundingClientRect();
  if (rect.height <= 0 || rect.top >= viewportHeight) return null;
  return rect.top;
};

/**
 * 하단 CTA 영역 안에서 가장 위에 있는 버튼의 윗면 위치를 구한다. 버튼이 없으면 영역 윗면을 쓴다.
 * (영역에는 배경·안쪽 여백이 있어서, 영역 윗면을 쓰면 버튼보다 여백만큼 높게 계산된다)
 */
const getCtaTop = (container: HTMLElement, viewportHeight: number): number | null => {
  const containerTop = getVisibleTop(container, viewportHeight);
  if (containerTop === null) return null;

  let buttonTop: number | null = null;
  container.querySelectorAll<HTMLElement>(CTA_BUTTON_SELECTOR).forEach((button) => {
    const top = getVisibleTop(button, viewportHeight);
    if (top !== null && (buttonTop === null || top < buttonTop)) buttonTop = top;
  });

  return buttonTop ?? containerTop;
};

/**
 * 화면 아래 끝에서 하단 CTA 버튼 윗면까지의 거리(px)를 잰다.
 * - `data-bottom-cta`가 붙은 영역 중 실제로 보이는 것만 본다 (높이 0, 화면 아래로 밀려난 것 제외)
 * - 영역 안에서 가장 위에 있는 버튼의 윗면을 기준으로 한다 (버튼이 없으면 영역 윗면)
 * - 영역이 여러 개면 가장 위쪽 윗면을 기준으로 한다
 * - 없으면 undefined
 */
const measureBottomCtaOffset = (): number | undefined => {
  if (typeof document === 'undefined') return undefined;

  const viewportHeight = window.innerHeight;
  let offset: number | undefined;

  document.querySelectorAll<HTMLElement>(`[${BOTTOM_CTA_ATTRIBUTE}]`).forEach((container) => {
    const top = getCtaTop(container, viewportHeight);
    if (top === null) return;

    const distance = viewportHeight - top;
    if (offset === undefined || distance > offset) offset = distance;
  });

  return offset;
};

/**
 * 화면 아래 끝에서 웹 하단 탭바 윗면까지의 거리(px)를 잰다. 탭바가 없거나 보이지 않으면 undefined.
 * (앱 웹뷰에서는 탭바가 네이티브라 웹에는 없다)
 */
const measureBottomNavOffset = (): number | undefined => {
  if (typeof document === 'undefined') return undefined;

  const viewportHeight = window.innerHeight;
  const nav = document.querySelector<HTMLElement>(`[${BOTTOM_NAV_ATTRIBUTE}]`);
  const top = nav ? getVisibleTop(nav, viewportHeight) : null;

  return top === null ? undefined : viewportHeight - top;
};

export { measureBottomCtaOffset, measureBottomNavOffset };
