import type { BridgeEventMap } from '@knockdog/bridge-core';
import type { Unsubscribe, Listener } from '../bridge/types';

type InternalListener = (payload: unknown) => void;

class EventListenerStore {
    private listeners = new Map<keyof BridgeEventMap, Set<InternalListener>>();

    on<K extends keyof BridgeEventMap>(event: K, listener: Listener<K>): Unsubscribe {
        if(!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }

        this.listeners.get(event)!.add(listener as InternalListener);

        return () => this.listeners.get(event)?.delete(listener as InternalListener);
    }

    once<K extends keyof BridgeEventMap>(event: K, listener: Listener<K>): Unsubscribe {
        const off = this.on(event, (payload) => {
            try {
                listener(payload);
            } finally {
                off();
            }
        });
        
        return off;
    }

    emit<K extends keyof BridgeEventMap>(event: K, payload: BridgeEventMap[K]) {
        this.listeners.get(event)?.forEach((listener) => listener(payload));
    }

    clear() {
        this.listeners.clear();
    }

    listenerCount<K extends keyof BridgeEventMap>(event: K) {
        return this.listeners.get(event)?.size ?? 0;
    }
}

export { EventListenerStore };