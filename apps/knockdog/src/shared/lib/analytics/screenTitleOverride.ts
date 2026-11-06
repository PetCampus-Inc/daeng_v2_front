type Listener = () => void;

let overrideTitle: string | null = null;
let overridePath: string | null = null;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

function setScreenTitleOverride(pathname: string, title: string | null) {
  const nextTitle = title?.trim() || null;
  if (overridePath === pathname && overrideTitle === nextTitle) return;

  overridePath = pathname;
  overrideTitle = nextTitle;
  emit();
}

function clearScreenTitleOverride(pathname?: string) {
  if (pathname && overridePath !== pathname) return;
  if (overrideTitle === null && overridePath === null) return;

  overridePath = null;
  overrideTitle = null;
  emit();
}

function getScreenTitleOverride(pathname: string): string | null {
  if (overridePath !== pathname) return null;
  return overrideTitle;
}

function subscribeScreenTitleOverride(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export {
  setScreenTitleOverride,
  clearScreenTitleOverride,
  getScreenTitleOverride,
  subscribeScreenTitleOverride,
};
