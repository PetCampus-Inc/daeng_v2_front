import { BridgeException, BRIDGE_VERSION, type BridgeMessage, type BridgeEventMap, makeId, type RPCMethod, type ParamsOf, type ResultOf } from '@knockdog/bridge-core';

import type { Listener, WebBridgeOptions } from './types';
import { EventListenerStore } from '../managers/EventListenerStore';
import { PendingRequestManager } from '../managers/PendingRequestManager';
import { WindowMessageReceiver } from '../transport/WindowMessageReceiver';
import { GlobalBridgeAdapter } from '../transport/GlobalBridgeAdapter';
import { postToNative } from '../transport/postToNative';

class WebBridge {
    private readonly timeoutMs: number;
    private readonly debug: boolean;
    private readonly warnOnNoNative: boolean;

    private readonly listeners = new EventListenerStore();
    private readonly pending = new PendingRequestManager();


    private readonly browserReceiver?: WindowMessageReceiver;
    private readonly globalBridgeAdapter?: GlobalBridgeAdapter;

    private destroyed = false;

    constructor(options: WebBridgeOptions = {}) {
        this.timeoutMs = options.timeoutMs ?? 8_000;
        this.debug = options.debug ?? false;
        this.warnOnNoNative = options.warnOnNoNative ?? true;

        if(options.enableWindowMessageReceiver !== false) {
            this.browserReceiver = new WindowMessageReceiver(this.handleIncoming);
            this.browserReceiver.attach();
        }

        if(options.enableGlobalBridgeReceiver !== false) {
            this.globalBridgeAdapter = new GlobalBridgeAdapter(this.handleIncoming, this.debug);
            this.globalBridgeAdapter.attach();
        }
    }

    private assertNotDestroyed() {
        if(this.destroyed) {
            throw new BridgeException({ code: 'EDESTROYED', message: 'bridge_destroyed' });
        }
    }

    private createMeta() {
        return {
            v: BRIDGE_VERSION,
            source: 'web' as const,
            ts: Date.now()
        }
    }

    private handleIncoming = (msg: BridgeMessage) => {
        if(this.destroyed) return;

        if(msg.type === 'response') {
            if(!msg.ok) {
                this.pending.reject(msg.id, new BridgeException({ ...msg.error }));
            } else {
                this.pending.resolve(msg.id, msg.result);
            }

            return;
        }

        if(msg.type === 'event') {
            this.listeners.emit(msg.event as keyof BridgeEventMap, msg.payload as BridgeEventMap[keyof BridgeEventMap]);
        }
    }

    on<K extends keyof BridgeEventMap>(event: K, cb: Listener<K>) {
        this.assertNotDestroyed();
        return this.listeners.on(event, cb);
    }

    // @TODO 삭제 예정
    once<K extends keyof BridgeEventMap>(event: K, cb: Listener<K>) {
        this.assertNotDestroyed();
        return this.listeners.once(event, cb);
    }

    emit<K extends keyof BridgeEventMap>(event: K, payload?: BridgeEventMap[K]) {
        this.assertNotDestroyed();
        
        const message: BridgeMessage = {
            id: makeId(),
            type: 'event',
            event: String(event),
            payload,
            meta: this.createMeta()
        }

        try {
            postToNative(JSON.stringify(message), {
                warnOnNoNative: this.warnOnNoNative
            })

        } catch(error) {
            if(process.env.NODE_ENV !== 'production' && this.warnOnNoNative) {
                console.warn('[bridge-web] 이벤트 전송 실패:', String(event), error);
            }
        }
    }

    request<K extends RPCMethod>(method: K, params: ParamsOf<K>, options?: { timeoutMs?: number }): Promise<ResultOf<K>>
    request<T = unknown>(method:string, params?: unknown, options?: { timeoutMs ?: number}): Promise<T>;

    request(method: string, params ?: unknown, options ?: { timeoutMs ?: number}) {
        this.assertNotDestroyed();

        const id = makeId();

        const message: BridgeMessage = {
            id, 
            type: 'request',
            method,
            params,
            meta: this.createMeta()
        }

        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this.pending.remove(id)
                reject(
                    new BridgeException({ code: 'ETIMEDOUT', message: `timeout ${method}` })
                )
            }, options?.timeoutMs ?? this.timeoutMs)

            this.pending.set(id, {
                resolve: resolve as (value: unknown) => void,
                reject: reject as (error: BridgeException) => void,
                timer
            })

            try {
                postToNative(JSON.stringify(message), {
                    warnOnNoNative: this.warnOnNoNative
                })
            } catch(error) {
                this.pending.remove(id)

                if(error instanceof BridgeException) {
                    reject(error)
                    return;
                }

                reject(new BridgeException({ code: 'EUNKNOWN', message: error instanceof Error ? error.message : "unknown_error" }))
            }
        })
    }

    destroy() {
        if(this.destroyed) return;

        this.destroyed = true;

        this.browserReceiver?.detach();
        this.globalBridgeAdapter?.detach();

        this.pending.rejectAll(new BridgeException({ code: 'EDESTROYED', message: 'bridge_destroyed' }));

        this.listeners.clear();
    }
}

export { WebBridge };


