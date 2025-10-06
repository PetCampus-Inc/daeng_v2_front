import type { NativeBridgeRouter } from '@knockdog/bridge-native';
import { registerDeviceHandlers } from './device';
import { registerNavigationHandlers } from './register-navigation';

export function registerAllHandlers(router: NativeBridgeRouter) {
  registerDeviceHandlers(router);
  registerNavigationHandlers(router);
}
