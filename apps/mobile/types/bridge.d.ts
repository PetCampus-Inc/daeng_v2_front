// @file: /packages/types/src/bridge.ts

export type BridgeEventType = 'ping' | 'pong' | 'getDeviceInfo' | 'deviceInfo';

export type BridgeMessage<T = unknown> = {
  type: BridgeEventType;
  payload?: T;
};
declare global {
  var webviewRef:
    | {
        postMessage?: (message: string) => void;
      }
    | undefined;
}
