import { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';

import { navigationRef, isNavReady } from '@/bridges/lib/navigationRef';
import { useMainTabModeStore } from '@/bridges/model/mainTabModeStore';
import { useBlockingOverlayStore } from '@/features/blocking-overlay';
import { isOwnerOnlyTab, type TabName } from '@/bridges/lib/tabRoutes';
import { toast } from '@/components/toast';

const EXIT_TOAST_TITLE = '뒤로 가기를 한 번 더 누르면 앱이 종료돼요';
const EXIT_TOAST_DURATION_MS = 2_000;

/** 토스트 노출 중에만 두 번째 back으로 종료 */
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

/**
 * 바텀탭 AOS 시스템 뒤로가기
 * - 보호자 홈 외 탭 → 내 주변(Explore)
 * - 원장 홈 외 탭 → 원장 홈
 * - 보호자 홈(내 주변) / 원장 홈 → 토스트 후 한 번 더 누르면 종료
 * Stack 포커스면 처리하지 않음
 */
function useAndroidTabBack() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onHardwareBackPress = () => {
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

      // 보호자 홈(내 주변)
      if (mode === 'guardian' && tabName === 'Explore') {
        return handleHomeExitBack();
      }

      // 보호자 홈 외 탭 → 내 주변
      if (mode === 'guardian') {
        clearExitArm();
        navigationRef.navigate('Tabs', { screen: 'Explore' });
        return true;
      }

      if (mode === 'owner') {
        if (tabName === 'OwnerHome') {
          return handleHomeExitBack();
        }

        // 원장 전용 탭 + 원장 모드 마이 → 홈으로. 종료 아밍은 리셋
        if (isOwnerOnlyTab(tabName) || tabName === 'Mypage') {
          clearExitArm();
          navigationRef.navigate('Tabs', { screen: 'OwnerHome' });
          return true;
        }
      }

      clearExitArm();
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
    return () => {
      subscription.remove();
      clearExitArm();
    };
  }, []);
}

export { useAndroidTabBack };
