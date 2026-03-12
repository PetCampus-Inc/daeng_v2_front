import type { BridgeMessage } from '@knockdog/bridge-core';

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage(message: string): void;
    };

    __bridge?: {
      receive: (msg: BridgeMessage) => void;
    };
    __bridgeDebug?: boolean;
  }
}

export {};