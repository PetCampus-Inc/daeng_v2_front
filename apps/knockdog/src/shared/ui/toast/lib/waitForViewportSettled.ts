/** 화면 크기 변화가 이 시간(ms) 동안 없으면 안정된 것으로 본다. */
const QUIET_MS = 120;

/** 화면이 안정되지 않아도 이 시간(ms)이 지나면 기다리기를 멈춘다. */
const MAX_WAIT_MS = 500;

/** 입력창 포커스 이동이나 화면 크기 변화가 이 시간(ms) 안에 있었으면 키보드가 움직이는 중으로 본다. */
const RECENT_ACTIVITY_MS = 600;

/** 글자를 입력하지 않는 input 종류. 포커스돼도 가상키보드가 뜨지 않는다. */
const NON_TEXT_INPUT_TYPES = new Set(['button', 'checkbox', 'radio', 'submit', 'reset', 'file', 'image', 'range', 'color']);

let lastActivityAt = 0;

/** 요소가 가상키보드를 띄우는 입력 요소인지 확인한다. */
const isEditableElement = (element: Element | null | undefined): boolean => {
  if (!element) return false;

  const { tagName, isContentEditable } = element as HTMLElement;
  if (isContentEditable) return true;
  if (tagName === 'TEXTAREA') return true;
  if (tagName === 'INPUT') return !NON_TEXT_INPUT_TYPES.has((element as HTMLInputElement).type);

  return false;
};

const markActivity = () => {
  lastActivityAt = Date.now();
};

const handleFocusChange = (event: Event) => {
  if (isEditableElement(event.target as Element | null)) markActivity();
};

/**
 * 가상키보드가 열리고 닫히는 신호(화면 크기 변화, 입력창 포커스 이동)를 지켜보기 시작한다.
 * 토스트를 띄우기 전에 시작돼 있어야 "방금 키보드가 내려갔는지"를 알 수 있어서 모듈을 불러올 때 한 번 켠다.
 */
const trackViewportActivity = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  window.addEventListener('resize', markActivity);
  window.visualViewport?.addEventListener('resize', markActivity);
  document.addEventListener('focusin', handleFocusChange, true);
  document.addEventListener('focusout', handleFocusChange, true);
};

/**
 * 토스트를 띄우기 전에 화면이 안정되길 기다려야 하는지 확인한다.
 * 입력창이 포커스돼 있거나, 최근에 키보드가 움직인 흔적(화면 크기 변화·입력창 포커스 이동)이 있으면 true.
 */
const shouldWaitForViewport = (): boolean => {
  if (typeof document === 'undefined') return false;
  if (isEditableElement(document.activeElement)) return true;

  return Date.now() - lastActivityAt < RECENT_ACTIVITY_MS;
};

/**
 * 화면 크기 변화가 `QUIET_MS` 동안 멈출 때까지 기다린다. 아무리 늦어도 `MAX_WAIT_MS`에는 끝난다.
 * 시작 후 `QUIET_MS`는 무조건 기다려서, 호출 직후에 일어나는 입력창 포커스 해제(키보드 내림)도 반영한다.
 */
const waitForViewportSettled = (): Promise<void> =>
  new Promise((resolve) => {
    const startedAt = Date.now();

    const check = () => {
      const now = Date.now();
      const waited = now - startedAt;
      const quietFor = now - lastActivityAt;

      if (waited >= MAX_WAIT_MS || (waited >= QUIET_MS && quietFor >= QUIET_MS)) {
        resolve();
        return;
      }

      const untilQuiet = Math.max(QUIET_MS - Math.min(waited, quietFor), 1);
      setTimeout(check, Math.min(untilQuiet, MAX_WAIT_MS - waited));
    };

    setTimeout(check, QUIET_MS);
  });

trackViewportActivity();

export { MAX_WAIT_MS, QUIET_MS, RECENT_ACTIVITY_MS, shouldWaitForViewport, waitForViewportSettled };
