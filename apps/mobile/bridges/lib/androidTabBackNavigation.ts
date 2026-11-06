import { BackHandler } from 'react-native';

import { useBlockingOverlayStore } from '@/features/blocking-overlay';
import { toast } from '@/components/toast';

import { navigationRef, isNavReady } from './navigationRef';
import type { TabName } from './tabRoutes';
import { useMainTabModeStore } from '../model/mainTabModeStore';

const EXIT_TOAST_TITLE = '뒤로 가기를 한 번 더 누르면 앱이 종료돼요';
const EXIT_TOAST_DURATION_MS = 2_000;
/** 첫 back 직후 바운스/중복 unhandled로 바로 종료되는 것 방지 */
const EXIT_ARM_MIN_HOLD_MS = 500;
/** 동일 back 제스처에서 중복 unhandled 흡수 */
const TAB_BACK_COALESCE_MS = 100;

let exitArmedAtMs = 0;
let exitArmedUntilMs = 0;
let lastTabBackNavAtMs = 0;

function getFocusedRootName(): string | null {
  if (!isNavReady()) return null;
  const state = navigationRef.getRootState();
  if (!state) return null;
  return state.routes[state.index ?? 0]?.name ?? null;
}

function getFocusedTabName(): TabName | null {
  if (!isNavReady()) return null;
  const state = navigationRef.getRootState();
  if (!state) return null;

  const root = state.routes[state.index ?? 0];
  if (root?.name !== 'Tabs') return null;

  const tabState = root.state;
  if (!tabState?.routes?.length) return null;

  const active = tabState.routes[tabState.index ?? 0];
  return (active?.name as TabName | undefined) ?? null;
}

function clearExitArm() {
  exitArmedAtMs = 0;
  exitArmedUntilMs = 0;
}

function isExitArmed(now = Date.now()) {
  return exitArmedUntilMs > 0 && now < exitArmedUntilMs;
}

function isHomeTab(tabName: TabName | null, mode: 'owner' | 'guardian') {
  if (!tabName) return false;
  if (mode === 'owner') return tabName === 'OwnerHome';
  return tabName === 'Explore';
}

/**
 * 홈에서 두 번째 하드웨어 back일 때만 종료.
 * unhandled 경로에서는 호출하지 않음 — 중복 unhandled로 토스트 없이 종료되던 케이스 차단.
 */
function tryExitAppIfArmed(): boolean {
  const now = Date.now();
  // Fast Refresh 등으로 until만 남은 stale 상태면 종료하지 않음
  if (exitArmedAtMs <= 0 || !isExitArmed(now)) return false;
  if (now - exitArmedAtMs < EXIT_ARM_MIN_HOLD_MS) return false;

  clearExitArm();
  BackHandler.exitApp();
  return true;
}

/** unhandled/홈 back 결과 — 토스트만. 여기서 exitApp 하지 않음 */
function armHomeExitToast() {
  const now = Date.now();
  if (isExitArmed(now)) return true;

  exitArmedAtMs = now;
  exitArmedUntilMs = now + EXIT_TOAST_DURATION_MS;
  toast({
    title: EXIT_TOAST_TITLE,
    duration: EXIT_TOAST_DURATION_MS,
    position: 'bottom',
  });
  return true;
}

/** Tabs 포커스에서 웹이 back을 소비하지 않았을 때 탭 네비게이션(홈/탭 전환) */
function handleAndroidTabBackNavigation(): boolean {
  const now = Date.now();
  if (now - lastTabBackNavAtMs < TAB_BACK_COALESCE_MS) {
    return true;
  }
  lastTabBackNavAtMs = now;

  const overlayContent = useBlockingOverlayStore.getState().content;
  if (overlayContent) {
    if (overlayContent.kind === 'confirm') {
      useBlockingOverlayStore.getState().resolveConfirmDialog('cancel');
    }
    return true;
  }

  // Tabs inject 후 Stack으로 이동한 뒤 도착한 stale unhandled — 무시
  // false 반환 시 일부 OEM/Android 버전에서 토스트 없이 Activity finish
  if (getFocusedRootName() !== 'Tabs') {
    clearExitArm();
    return true;
  }

  const mode = useMainTabModeStore.getState().mode;
  const tabName = getFocusedTabName();

  if (!tabName) {
    return true;
  }

  if (isHomeTab(tabName, mode)) {
    return armHomeExitToast();
  }

  clearExitArm();
  navigationRef.navigate('Tabs', {
    screen: mode === 'owner' ? 'OwnerHome' : 'Explore',
  });
  return true;
}

export {
  getFocusedRootName,
  getFocusedTabName,
  handleAndroidTabBackNavigation,
  clearExitArm,
  tryExitAppIfArmed,
  isHomeTab,
  isExitArmed,
};
