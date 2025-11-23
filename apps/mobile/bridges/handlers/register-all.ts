import type { NativeBridgeRouter } from '@knockdog/bridge-native';
import { registerDeviceHandlers } from './device';
import { registerNavigationHandlers } from './register-navigation';
import { registerRouteMapHandlers } from './register-route-map';
import { registerToastHandlers } from './register-toast';
import { registerAuthHandlers } from './register-auth';
import type { RefObject } from 'react';
import type WebView from 'react-native-webview';

export function registerAllHandlers(router: NativeBridgeRouter, options?: { currentWebRef: RefObject<WebView> }) {
  registerDeviceHandlers(router);
  registerNavigationHandlers(router, options);
  registerRouteMapHandlers(router);
  registerToastHandlers(router);
  registerAuthHandlers(router);
}
