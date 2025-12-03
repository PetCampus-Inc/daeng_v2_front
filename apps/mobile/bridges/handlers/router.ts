import { NativeBridgeRouter } from '@knockdog/bridge-native';
import { registerAllHandlers } from './register-all';
import type { RefObject } from 'react';
import type { WebView } from 'react-native-webview';
import type { ExtendedNativeBridgeRouter } from '@/types/image-picker';

/**
 * 네이티브 브릿지 라우터 생성
 */
function makeRouter(currentWebRef: RefObject<WebView>) {
  const router = new NativeBridgeRouter() as NativeBridgeRouter & ExtendedNativeBridgeRouter;

  registerAllHandlers(router, { currentWebRef });

  return router;
}

export { makeRouter };
