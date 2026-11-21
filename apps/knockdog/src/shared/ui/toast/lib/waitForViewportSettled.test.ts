import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type FakeElement = { tagName: string; type?: string; isContentEditable?: boolean };
type FakeEvent = { target?: FakeElement };
type FakeListener = (event: FakeEvent) => void;

const TEXTAREA = { tagName: 'TEXTAREA' };
const BUTTON = { tagName: 'BUTTON' };

/** 브라우저 없이 테스트하기 위해 window·document를 흉내 낸다. 이벤트는 dispatch로 직접 일으킨다. */
function installFakeBrowser(activeElement: FakeElement | null = null) {
  const listeners = new Map<string, FakeListener[]>();
  const addEventListener = (type: string, listener: FakeListener) => {
    listeners.set(type, [...(listeners.get(type) ?? []), listener]);
  };
  const documentStub = { activeElement, addEventListener };

  vi.stubGlobal('window', { addEventListener, visualViewport: { addEventListener } });
  vi.stubGlobal('document', documentStub);

  return {
    setActiveElement(element: FakeElement | null) {
      documentStub.activeElement = element;
    },
    dispatch(type: string, event: FakeEvent = {}) {
      listeners.get(type)?.forEach((listener) => listener(event));
    },
  };
}

/** 모듈 안의 "마지막 변화 시각"이 테스트끼리 섞이지 않도록 매번 새로 불러온다. */
async function loadModule() {
  vi.resetModules();
  return import('./waitForViewportSettled');
}

describe('shouldWaitForViewport', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000_000);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('입력창 포커스도 최근 키보드 변화도 없으면 기다리지 않는다', async () => {
    installFakeBrowser(BUTTON);
    const { shouldWaitForViewport } = await loadModule();

    expect(shouldWaitForViewport()).toBe(false);
  });

  it('입력창이 포커스돼 있으면 기다린다', async () => {
    installFakeBrowser(TEXTAREA);
    const { shouldWaitForViewport } = await loadModule();

    expect(shouldWaitForViewport()).toBe(true);
  });

  it('글자를 입력하지 않는 input이 포커스돼 있으면 기다리지 않는다', async () => {
    installFakeBrowser({ tagName: 'INPUT', type: 'checkbox' });
    const { shouldWaitForViewport } = await loadModule();

    expect(shouldWaitForViewport()).toBe(false);
  });

  it('글자를 입력하는 input이 포커스돼 있으면 기다린다', async () => {
    installFakeBrowser({ tagName: 'INPUT', type: 'text' });
    const { shouldWaitForViewport } = await loadModule();

    expect(shouldWaitForViewport()).toBe(true);
  });

  it('입력창에서 포커스가 빠진 직후에는 기다리고, 일정 시간이 지나면 기다리지 않는다', async () => {
    const browser = installFakeBrowser(null);
    const { RECENT_ACTIVITY_MS, shouldWaitForViewport } = await loadModule();

    browser.dispatch('focusout', { target: TEXTAREA });
    expect(shouldWaitForViewport()).toBe(true);

    vi.advanceTimersByTime(RECENT_ACTIVITY_MS - 1);
    expect(shouldWaitForViewport()).toBe(true);

    vi.advanceTimersByTime(1);
    expect(shouldWaitForViewport()).toBe(false);
  });

  it('화면 크기가 바뀐 직후에는 기다린다', async () => {
    const browser = installFakeBrowser(null);
    const { shouldWaitForViewport } = await loadModule();

    browser.dispatch('resize');

    expect(shouldWaitForViewport()).toBe(true);
  });

  it('입력창이 아닌 요소의 포커스 이동은 키보드 변화로 보지 않는다', async () => {
    const browser = installFakeBrowser(null);
    const { shouldWaitForViewport } = await loadModule();

    browser.dispatch('focusin', { target: BUTTON });

    expect(shouldWaitForViewport()).toBe(false);
  });
});

describe('waitForViewportSettled', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000_000);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('변화가 없어도 안정 시간만큼은 기다린 뒤 끝난다', async () => {
    installFakeBrowser(TEXTAREA);
    const { QUIET_MS, waitForViewportSettled } = await loadModule();
    let isDone = false;
    waitForViewportSettled().then(() => {
      isDone = true;
    });

    await vi.advanceTimersByTimeAsync(QUIET_MS - 1);
    expect(isDone).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    expect(isDone).toBe(true);
  });

  it('화면 크기 변화가 이어지면 멈추고 안정 시간이 지날 때까지 기다린다', async () => {
    const browser = installFakeBrowser(TEXTAREA);
    const { QUIET_MS, waitForViewportSettled } = await loadModule();
    let isDone = false;
    waitForViewportSettled().then(() => {
      isDone = true;
    });

    await vi.advanceTimersByTimeAsync(100);
    browser.dispatch('resize');
    await vi.advanceTimersByTimeAsync(100);
    browser.dispatch('resize');

    // 마지막 변화(200ms)로부터 안정 시간이 지나기 직전
    await vi.advanceTimersByTimeAsync(QUIET_MS - 1);
    expect(isDone).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    expect(isDone).toBe(true);
  });

  it('화면이 계속 흔들려도 최대 대기 시간에는 끝난다', async () => {
    const browser = installFakeBrowser(TEXTAREA);
    const { MAX_WAIT_MS, waitForViewportSettled } = await loadModule();
    let isDone = false;
    waitForViewportSettled().then(() => {
      isDone = true;
    });

    // 50ms마다 화면 크기가 바뀌어 안정 시간이 영원히 채워지지 않는 상황 (450ms까지)
    for (let elapsed = 50; elapsed < MAX_WAIT_MS; elapsed += 50) {
      await vi.advanceTimersByTimeAsync(50);
      browser.dispatch('resize');
    }

    await vi.advanceTimersByTimeAsync(49);
    expect(isDone).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    expect(isDone).toBe(true);
  });
});
