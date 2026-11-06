import type { BridgeMessage } from '@knockdog/bridge-core';

declare global {
  interface Window {
    __bridge?: {
      receive: (msg: BridgeMessage) => void;
    };
    __bridgeDebug?: boolean;
  }
}
