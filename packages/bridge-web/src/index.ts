import { BRIDGE_VERSION, safeParse, makeId, type BridgeMessage, type BridgeEventMap } from '@knockdog/bridge-core';

type Unsubscribes = () => void;
type Listener<K extends keyof BridgeEventMap = keyof BridgeEventMap> = (payload: BridgeEventMap[K]) => void;

class WebBridge {
  private pending = new Map<
    string,
    { resolve: (v: unknown) => void; reject: (e: unknown) => void; timer: ReturnType<typeof setTimeout> }
  >();
  private listeners = new Map<string, Set<(payload: unknown) => void>>();

  constructor(private timeoutMs = 8000) {
    // WebView환경이 아닐때 대비
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this._onMessage);

      // 웹 쪽 전역 리시버(네이티브가 injectJS로 호출)
      if (!window.__bridge) {
        window.__bridge = { receive: (msg: BridgeMessage) => this._handleIncoming(msg) };
      } else if (window.__bridgeDebug) {
        console.warn('[WebBridge] window.__bridge 가 이미 설정되어 있습니다; 리시버 덮어씁니다');
        window.__bridge.receive = (msg) => this._handleIncoming(msg);
      }
    }
  }

  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('message', this._onMessage);
    }

    this.pending.forEach((p) => p.reject(new Error('bridge_destroyed')));
    this.pending.clear();
    this.listeners.clear();
  }

  on<K extends keyof BridgeEventMap>(event: K, cb: Listener<K>): Unsubscribes {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(cb as (payload: unknown) => void);
    return () => this.listeners.get(event)?.delete(cb as (payload: unknown) => void);
  }

  async request<T = unknown>(method: string, params?: unknown): Promise<T> {
    const id = makeId();

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject({ code: 'ETIMEDOUT', message: `timeout ${method}` });
      }, this.timeoutMs);

      this.pending.set(id, {
        resolve: resolve as (v: unknown) => void,
        reject: reject as (e: unknown) => void,
        timer,
      });

      // Web -> Native
      window.ReactNativeWebView?.postMessage(
        JSON.stringify({
          id,
          type: 'request',
          method,
          params,
          meta: { v: BRIDGE_VERSION, source: 'web', ts: Date.now() },
        } satisfies BridgeMessage)
      );
    });
  }

  // Native -> Web (via window.postMessage)
  private _onMessage = (e: MessageEvent) => {
    const data = typeof e.data === 'string' ? safeParse(e.data) : e.data;
    if (data) this._handleIncoming(data);
  };

  private _handleIncoming(msg: BridgeMessage) {
    if (msg.type === 'response') {
      const entry = this.pending.get(msg.id);
      if (!entry) return;

      clearTimeout(entry.timer);
      this.pending.delete(msg.id);

      if ('error' in msg) {
        entry.reject(msg.error);
      } else {
        entry.resolve(msg.result);
      }

      return;
    } else if (msg.type === 'event') {
      this._emit(msg.event as keyof BridgeEventMap, msg.payload as BridgeEventMap[keyof BridgeEventMap]);
    }
  }

  private _emit<K extends keyof BridgeEventMap>(event: K, payload: BridgeEventMap[K]) {
    this.listeners.get(event)?.forEach((cb) => cb(payload));
  }
}

export { WebBridge };
