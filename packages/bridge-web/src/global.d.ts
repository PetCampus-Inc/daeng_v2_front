import type { BridgeMessage } from '@knockdog/bridge-core';

declare global {
  interface Window {
    __bridge: {
      receive: (msg: BridgeMessage) => void;
    };
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    __bridgeDebug: boolean;
  }
}
