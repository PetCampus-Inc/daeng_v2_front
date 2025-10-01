import { NativeBridgeRouter } from '@knockdog/bridge-native';
import { registerDeviceHandlers } from './device';

/**
 * 네이티브 브릿지 라우터 생성
 * @returns
 */
function makeRouter() {
  const router = new NativeBridgeRouter();
  registerDeviceHandlers(router);
  return router;
}

export { makeRouter };
