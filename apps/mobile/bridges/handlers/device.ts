import { initialWindowMetrics } from 'react-native-safe-area-context';
import { NativeBridgeRouter } from '@knockdog/bridge-native';
import { METHODS, type SafeAreaInsets } from '@knockdog/bridge-core';

/**
 * 디바이스 정보 핸들러
 */
export function registerDeviceHandlers(router: NativeBridgeRouter) {
  /** SafeArea 여백 가져오기 */
  router.register(METHODS.getSafeAreaInsets, (): SafeAreaInsets => {
    const insets = initialWindowMetrics?.insets;

    if (!insets) {
      // initialWindowMetrics가 없는 경우 기본값 반환
      return { top: 0, bottom: 0, left: 0, right: 0 };
    }

    return {
      top: insets.top,
      bottom: insets.bottom,
      left: insets.left,
      right: insets.right,
    };
  });
}
