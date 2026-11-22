/**
 * 오버레이를 열 때 쌓은 방문 기록은 닫을 때 뒤로가기로 지운다.
 * 닫으면서 주소(쿼리)를 바꾸는 동작이 이 뒤로가기보다 먼저 기록되면,
 * 뒤로가기가 오버레이를 열기 전 주소로 되돌려 바꾼 값이 사라진다.
 * (iOS 웹뷰는 주소 기록이 느려 이 순서가 되기 쉽다)
 * 그래서 닫은 뒤 주소를 바꾸는 쪽은 이 뒤로가기가 끝나기를 기다린 뒤 바꾼다.
 */

/** 뒤로가기 완료 신호가 오지 않을 때 더 기다리지 않는 시간 */
const POP_WAIT_TIMEOUT_MS = 1000;

interface PendingPop {
  promise: Promise<void>;
  resolve: () => void;
}

let pendingPop: PendingPop | null = null;

/** 오버레이 기록을 지우는 뒤로가기를 시작할 때 호출한다. */
const startOverlayHistoryPop = () => {
  if (pendingPop) return;

  let resolvePop: () => void = () => {};
  const promise = new Promise<void>((resolve) => {
    resolvePop = resolve;
  });
  pendingPop = { promise, resolve: resolvePop };
};

/**
 * 그 뒤로가기의 popstate 처리를 마쳤을 때 호출한다.
 * 같은 popstate를 듣는 다른 처리(쿼리 상태 라이브러리, 라우터)가 모두 끝난 뒤 알리도록 다음 작업으로 미룬다.
 * 바로 알리면 기다리던 쪽이 그 사이에 주소를 바꾸고, 뒤이은 popstate 처리가 그 변경을 취소한다.
 */
const finishOverlayHistoryPop = () => {
  const pop = pendingPop;
  pendingPop = null;
  if (pop) window.setTimeout(pop.resolve, 0);
};

/**
 * 오버레이를 닫은 직후 호출해, 기록을 지우는 뒤로가기가 끝날 때까지 기다린다.
 * 뒤로가기가 없으면 바로 끝난다.
 */
const waitForOverlayHistoryPop = async () => {
  // 닫기로 인한 오버레이 정리(뒤로가기 시작)가 먼저 실행되도록 한 번 양보한다.
  await new Promise<void>((resolve) => window.setTimeout(resolve, 0));

  const pop = pendingPop;
  if (!pop) return;

  let timeoutId = 0;
  const timeout = new Promise<void>((resolve) => {
    timeoutId = window.setTimeout(resolve, POP_WAIT_TIMEOUT_MS);
  });

  await Promise.race([pop.promise, timeout]);
  window.clearTimeout(timeoutId);
  if (pendingPop === pop) pendingPop = null;
};

export { startOverlayHistoryPop, finishOverlayHistoryPop, waitForOverlayHistoryPop };
