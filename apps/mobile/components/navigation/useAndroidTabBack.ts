import { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';

import { NATIVE_BACK_INJECT } from '@/bridges/lib/nativeBackInject';
import {
  clearExitArm,
  getFocusedRootName,
  getFocusedTabName,
  handleAndroidTabBackNavigation,
  isHomeTab,
  tryExitAppIfArmed,
} from '@/bridges/lib/androidTabBackNavigation';
import { useMainTabModeStore } from '@/bridges/model/mainTabModeStore';
import { useBlockingOverlayStore } from '@/features/blocking-overlay';
import { tabWebViewStore } from '@/bridges/model/tabWebViewStore';

/**
 * 바텀탭 AOS 시스템 뒤로가기
 *
 * 절대 `false`를 반환하지 않음 — false면 일부 기기에서 토스트 없이 Activity finish.
 * 종료는 홈 + 이미 arm된 상태에서 두 번째 하드웨어 back일 때만.
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

      const rootName = getFocusedRootName();

      // Stack: StackScreen에 위임 (역순 호출). false여도 App 최후 방어가 Activity finish 막음.
      if (rootName === 'Stack') {
        clearExitArm();
        return false;
      }

      if (rootName !== 'Tabs') {
        return true;
      }

      const mode = useMainTabModeStore.getState().mode;
      const tabName = getFocusedTabName();

      if (!tabName) {
        return true;
      }

      // 두 번째 하드웨어 back에서만 종료
      if (isHomeTab(tabName, mode) && tryExitAppIfArmed()) {
        return true;
      }

      if (!isHomeTab(tabName, mode)) {
        clearExitArm();
      }

      const webview = tabWebViewStore.get(tabName)?.current;
      if (webview) {
        webview.injectJavaScript(NATIVE_BACK_INJECT);
        return true;
      }

      return handleAndroidTabBackNavigation();
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
    return () => {
      subscription.remove();
      clearExitArm();
    };
  }, []);
}

export { useAndroidTabBack };
