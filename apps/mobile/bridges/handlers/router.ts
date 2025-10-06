import { NativeBridgeRouter } from '@knockdog/bridge-native';
import { registerAllHandlers } from './register-all';

/**
 * 네이티브 브릿지 라우터 생성
 * @returns
 */
function makeRouter() {
  const router = new NativeBridgeRouter();
  registerAllHandlers(router);
  return router;
}

export { makeRouter };
