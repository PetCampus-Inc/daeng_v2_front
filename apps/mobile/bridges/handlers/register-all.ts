import { registerLocationHandlers } from './location';
import { registerSystemHandlers } from './system';
import { registerDeviceHandlers } from './device';
import { registerNavigationHandlers } from './register-navigation';
import { registerRouteMapHandlers } from './register-route-map';
import { registerToastHandlers } from './register-toast';

import { registerImagePickerHandlers } from './register-image-picker';
import type { RefObject } from 'react';
import type { WebView } from 'react-native-webview';
import type { NativeBridgeRouter } from '@knockdog/bridge-native';
import type { ExtendedNativeBridgeRouter } from '@/types/image-picker';

export function registerAllHandlers(
  router: NativeBridgeRouter & ExtendedNativeBridgeRouter,
  options?: { currentWebRef: RefObject<WebView> }
) {
  registerDeviceHandlers(router);
  registerLocationHandlers(router);
  registerSystemHandlers(router);
  registerNavigationHandlers(router, options);
  registerRouteMapHandlers(router);
  registerToastHandlers(router);

  // 이미지 피커 핸들러는 이벤트 방식으로 동작하므로 나중에 설정
  router.getImagePickerHandlers = () => router.imagePickerHandlers;
  router.setImagePickerHandlers = (webRef, sendEvent) => {
    router.imagePickerHandlers = registerImagePickerHandlers({ sendEvent });
  };
}
