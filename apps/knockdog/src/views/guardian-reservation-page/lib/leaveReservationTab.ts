import { isNativeWebView } from '@shared/lib/device';

type GoBack = () => Promise<boolean>;
type OpenReservationTab = (tab: '/reservation') => Promise<unknown>;

interface HistoryIndexState {
  idx?: unknown;
}

function hasInAppHistory() {
  const state = window.history.state as HistoryIndexState | null;
  if (typeof state?.idx === 'number') return state.idx > 0;
  return window.history.length > 1;
}

function leaveReservationTab(back: GoBack, navigateToTab: OpenReservationTab) {
  // 웹 back()은 이전 기록이 없어도 true를 반환한다.
  if (!isNativeWebView() && !hasInAppHistory()) {
    navigateToTab('/reservation').catch(() => undefined);
    return;
  }

  back()
    .then((wentBack) => {
      if (wentBack) return;
      return navigateToTab('/reservation');
    })
    .catch(() => navigateToTab('/reservation'))
    .catch(() => undefined);
}

export { leaveReservationTab };
