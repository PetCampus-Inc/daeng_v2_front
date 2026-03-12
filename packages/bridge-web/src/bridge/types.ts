import type { BridgeEventMap } from '@knockdog/bridge-core';

type Unsubscribe = () => void;

type Listener<K extends keyof BridgeEventMap = keyof BridgeEventMap> = (payload: BridgeEventMap[K]) => void;

interface WebBridgeOptions {
    timeoutMs?: number;
    debug?: boolean;
    enableWindowMessageReceiver?: boolean;
    enableGlobalBridgeReceiver?: boolean;
    warnOnNoNative?: boolean;
}

export type { Unsubscribe, Listener, WebBridgeOptions };


