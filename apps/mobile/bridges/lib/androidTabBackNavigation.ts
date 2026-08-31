import { BackHandler } from 'react-native';

import { useBlockingOverlayStore } from '@/features/blocking-overlay';
import { toast } from '@/components/toast';

import { navigationRef, isNavReady } from './navigationRef';
import { isOwnerOnlyTab, type TabName } from './tabRoutes';
import { useMainTabModeStore } from '../model/mainTabModeStore';

const EXIT_TOAST_TITLE = '뒤로 가기를 한 번 더 누르면 앱이 종료돼요';
const EXIT_TOAST_DURATION_MS = 2_000;

let exitArmedUntilMs = 0;

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
  exitArmedUntilMs = 0;
}

function handleHomeExitBack() {
  const now = Date.now();
  if (now < exitArmedUntilMs) {
    clearExitArm();
    BackHandler.exitApp();
    return true;
  }

  exitArmedUntilMs = now + EXIT_TOAST_DURATION_MS;
  toast({
    title: EXIT_TOAST_TITLE,
    duration: EXIT_TOAST_DURATION_MS,
    shape: 'square',
    position: 'bottom',
  });
  return true;
}

/** Tabs 포커스에서 웹이 back을 소비하지 않았을 때 탭 네비게이션(홈/탭 전환) */
function handleAndroidTabBackNavigation(): boolean {
  const overlayContent = useBlockingOverlayStore.getState().content;
  if (overlayContent) {
    if (overlayContent.kind === 'confirm') {
      useBlockingOverlayStore.getState().resolveConfirmDialog('cancel');
    }
    return true;
  }

  if (getFocusedRootName() !== 'Tabs') {
    clearExitArm();
    return false;
  }

  const mode = useMainTabModeStore.getState().mode;
  const tabName = getFocusedTabName();
  if (!tabName) return false;

  if (mode === 'guardian' && tabName === 'Explore') {
    return handleHomeExitBack();
  }

  if (mode === 'guardian') {
    clearExitArm();
    navigationRef.navigate('Tabs', { screen: 'Explore' });
    return true;
  }

  if (mode === 'owner') {
    if (tabName === 'OwnerHome') {
      return handleHomeExitBack();
    }

    if (isOwnerOnlyTab(tabName) || tabName === 'Mypage') {
      clearExitArm();
      navigationRef.navigate('Tabs', { screen: 'OwnerHome' });
      return true;
    }
  }

  clearExitArm();
  return false;
}

export { getFocusedRootName, getFocusedTabName, handleAndroidTabBackNavigation, clearExitArm };
