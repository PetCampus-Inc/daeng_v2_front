const POP_WAIT_TIMEOUT_MS = 1000;

interface PendingPop {
  promise: Promise<void>;
  resolve: () => void;
}

let pendingPop: PendingPop | null = null;

const startOverlayHistoryPop = () => {
  if (pendingPop) return;

  let resolvePop: () => void = () => {};
  const promise = new Promise<void>((resolve) => {
    resolvePop = resolve;
  });
  pendingPop = { promise, resolve: resolvePop };
};

const finishOverlayHistoryPop = () => {
  const pop = pendingPop;
  pendingPop = null;
  if (pop) window.setTimeout(pop.resolve, 0);
};

const waitForOverlayHistoryPop = async () => {
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
