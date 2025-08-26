export type BridgeEventType =
  | 'ping'
  | 'pong'
  | 'getDeviceInfo'
  | 'deviceInfo'
  | 'whatever';

export type BridgeMessage<T = unknown> = {
  type: BridgeEventType;
  payload?: T;
};

// RN 전역 (모바일에서만 사용)
declare global {
  var webviewRef:
    | {
        postMessage?: (message: string) => void;
        injectJavaScript?: (script: string) => void;
      }
    | null
    | undefined;
}

export {};
