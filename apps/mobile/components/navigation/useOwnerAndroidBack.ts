import { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';

import { navigationRef, isNavReady } from '@/bridges/lib/navigationRef';
import { useMainTabModeStore } from '@/bridges/model/mainTabModeStore';
import { isOwnerOnlyTab, type TabName } from '@/bridges/lib/tabRoutes';

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

/**
 * 원장 바텀탭 AOS 시스템 뒤로가기
 * - 원장 홈 외 탭(일과/앨범/구성원/마이) → 원장 홈
 * - 원장 홈 → 앱 종료
 * Stack 화면이 포커스면 처리하지 않음
 */
function useOwnerAndroidBack() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onHardwareBackPress = () => {
      if (getFocusedRootName() !== 'Tabs') return false;
      if (useMainTabModeStore.getState().mode !== 'owner') return false;

      const tabName = getFocusedTabName();
      if (!tabName) return false;

      if (tabName === 'OwnerHome') {
        BackHandler.exitApp();
        return true;
      }

      // 원장 전용 탭 + 원장 모드에서의 마이
      if (isOwnerOnlyTab(tabName) || tabName === 'Mypage') {
        navigationRef.navigate('Tabs', { screen: 'OwnerHome' });
        return true;
      }

      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
    return () => subscription.remove();
  }, []);
}

export { useOwnerAndroidBack };
