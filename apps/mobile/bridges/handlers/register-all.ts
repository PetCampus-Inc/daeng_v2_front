import type { NativeBridgeRouter } from '@knockdog/bridge-native';
import { registerDeviceHandlers } from './device';
import { registerNavigationHandlers } from './register-navigation';
import { registerRouteMapHandlers } from './register-route-map';
import { registerToastHandlers } from './register-toast';
import { registerImagePickerHandlers } from './register-image-picker';
import type { RefObject } from 'react';
import type { WebView } from 'react-native-webview';

type ImagePickerPayload =
  | {
      requestId: string;
      mediaTypes?: 'images' | 'videos' | 'all';
      allowsEditing?: boolean;
      quality?: number;
      aspect?: [number, number];
    }
  | { requestId: string; quality?: number; orderedSelection?: boolean; selectionLimit?: number };

type ImagePickerHandlers = {
  'media.pickImage': (payload: ImagePickerPayload) => Promise<void>;
  'media.pickImages': (payload: ImagePickerPayload) => Promise<void>;
};

export function registerAllHandlers(
  router: NativeBridgeRouter & {
    imagePickerHandlers?: ImagePickerHandlers;
    getImagePickerHandlers?: () => ImagePickerHandlers | undefined;
    setImagePickerHandlers?: (
      webRef: RefObject<WebView>,
      sendEvent: (event: string, payload?: unknown) => void
    ) => void;
  },
  options?: { currentWebRef: RefObject<WebView> }
) {
  registerDeviceHandlers(router);
  registerNavigationHandlers(router, options);
  registerRouteMapHandlers(router);
  registerToastHandlers(router);

  // 이미지 피커 핸들러는 이벤트 방식으로 동작하므로 나중에 설정
  router.getImagePickerHandlers = () => router.imagePickerHandlers;
  router.setImagePickerHandlers = (webRef, sendEvent) => {
    router.imagePickerHandlers = registerImagePickerHandlers(webRef, { sendEvent });
  };
}
