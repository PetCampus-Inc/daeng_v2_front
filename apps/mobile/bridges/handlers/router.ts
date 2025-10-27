import { NativeBridgeRouter } from '@knockdog/bridge-native';
import { registerAllHandlers } from './register-all';
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

/**
 * 네이티브 브릿지 라우터 생성
 */
function makeRouter(currentWebRef: RefObject<WebView>) {
  const router = new NativeBridgeRouter() as NativeBridgeRouter & {
    imagePickerHandlers?: ImagePickerHandlers;
    getImagePickerHandlers?: () => ImagePickerHandlers | undefined;
    setImagePickerHandlers?: (
      webRef: RefObject<WebView>,
      sendEvent: (event: string, payload?: unknown) => void
    ) => void;
  };

  registerAllHandlers(router, { currentWebRef });

  return router;
}

export { makeRouter };
