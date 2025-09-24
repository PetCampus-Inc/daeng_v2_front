import type { BridgeMessage } from './types';

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
