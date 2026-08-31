import { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';

import { NATIVE_BACK_INJECT } from '@/bridges/lib/nativeBackInject';
import {
  clearExitArm,
  getFocusedRootName,
  getFocusedTabName,
  handleAndroidTabBackNavigation,
} from '@/bridges/lib/androidTabBackNavigation';
import { useBlockingOverlayStore } from '@/features/blocking-overlay';
import { tabWebViewStore } from '@/bridges/model/tabWebViewStore';

/**
 * 바텀탭 AOS 시스템 뒤로가기
 * 1. 네이티브 오버레이(확인 모달) 닫기
 * 2. 활성 탭 WebView에 native-back 주입 → 바텀시트/웹 모달 우선 닫기
 * 3. 웹이 소비하지 않으면 handleAndroidTabBackNavigation (홈/탭 전환)
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

      const tabName = getFocusedTabName();
      if (!tabName) return false;

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
