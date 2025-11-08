import { registerLocationHandlers } from './location';
import { registerSystemHandlers } from './system';
import { registerDeviceHandlers } from './device';
import { registerNavigationHandlers } from './register-navigation';
import { registerRouteMapHandlers } from './register-route-map';
import { registerToastHandlers } from './register-toast';

import type { RefObject } from 'react';
import type WebView from 'react-native-webview';
import type { NativeBridgeRouter } from '@knockdog/bridge-native';

export function registerAllHandlers(router: NativeBridgeRouter, options?: { currentWebRef: RefObject<WebView> }) {
  registerDeviceHandlers(router);
  registerLocationHandlers(router);
  registerSystemHandlers(router);
  registerNavigationHandlers(router, options);
  registerRouteMapHandlers(router);
  registerToastHandlers(router);
}
