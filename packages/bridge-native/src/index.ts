import type { RefObject } from 'react';
import type { WebView, WebViewMessageEvent } from 'react-native-webview';
import { BRIDGE_VERSION, safeParse, type BridgeRequest, type BridgeMessage } from '@knockdog/bridge-core';
import { normalizeError } from './utils';

/** 네이티브에서 실행될 핸들러 타입 (요청 -> 응답) */
type NativeHandler = (params: unknown) => unknown | Promise<unknown>;

/** 메서드 라우터: method 이름에 따라 핸들러를 찾아 실행 */
class NativeBridgeRouter {
  private handlers = new Map<string, (params: unknown) => unknown | Promise<unknown>>();

  /** 메서드 등록 ex. device.getGeolocation */
  register<P = unknown, R = unknown>(method: string, handler: (params: P) => R | Promise<R>) {
    const wrapped = (params: unknown) => handler(params as P);
    this.handlers.set(method, wrapped);
  }

  /** 메서드 제거 */
  unregister(method: string) {
    this.handlers.delete(method);
  }

  /** 메서드 존재 여부 */
  has(method: string) {
    return this.handlers.has(method);
  }

  /** 요청 실행 */
  async handle(req: BridgeRequest) {
    const h = this.handlers.get(req.method);
    if (!h) {
      // 표준 에러로 throw → 상위에서 그대로 사용 가능
      throw { code: 'ENOENT', message: `No handler for ${req.method}`, data: { method: req.method } };
    }
    return await h(req.params);
  }

  /** 현재 등록된 메서드 목록 */
  list() {
    return [...this.handlers.keys()];
  }
}

/** RN -> Web 전송: injectJavaScript로 웹 전역 리시버 호출 */
function sendToWeb(webRef: RefObject<WebView>, msg: BridgeMessage) {
  // JSON 직렬화 & 스크립트 컨텍스트 이스케이프(</script>, U+2028/2029)
  const safe = JSON.stringify(msg)
    .replace(/<\/script/gi, '<\\/script')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  webRef?.current?.injectJavaScript(`window.__bridge?.receive(${safe}); true;`);
}

/**
 * 네이티브(WebView 화면)에서 쓸 헬퍼
 * - onMessage: Web → Native 메시지 수신 핸들러 (WebView prop에 연결)
 * - sendEvent: Native → Web 이벤트 브로드캐스트
 * - notifyReady: 브릿지 준비 및 지원 메서드 목록 통지
 */
function wireWebView(webRef: RefObject<WebView>, router: NativeBridgeRouter) {
  /** Web -> Native */
  const onMessage = async (e: WebViewMessageEvent) => {
    const raw = e?.nativeEvent?.data;
    const msg = typeof raw === 'string' ? safeParse(raw) : raw;

    // 최소 유효성 검사
    if (!msg || typeof msg !== 'object') return;

    // 콘솔 메시지 처리
    if ((msg as any).__console) {
      const consoleMsg = msg as any;
      const level = consoleMsg.level || 'log';
      const args = consoleMsg.args || [];

      // React Native 콘솔로 출력
      switch (level) {
        case 'error':
          console.error('[WebView]', ...args);
          break;
        case 'warn':
          console.warn('[WebView]', ...args);
          break;
        case 'log':
        default:
          console.log('[WebView]', ...args);
          break;
      }
      return;
    }

    // 브릿지 요청 처리
    if ((msg as any).type !== 'request') return;

    const req = msg as BridgeRequest;

    // 필수 필드 확인
    if (!req.id || !req.method) {
      sendToWeb(webRef, {
        id: (req as any)?.id ?? `invalid-${Date.now()}`,
        type: 'response',
        ok: false,
        error: { code: 'EUNKNOWN', message: 'invalid request', data: msg },
        meta: { v: BRIDGE_VERSION, source: 'native', ts: Date.now() },
      });
      return;
    }

    try {
      const result = await router.handle(req);
      sendToWeb(webRef, {
        id: req.id,
        type: 'response',
        ok: true,
        result,
        meta: { v: BRIDGE_VERSION, source: 'native', ts: Date.now() },
      });
    } catch (err: unknown) {
      const shape = normalizeError(err, { code: 'EUNKNOWN', message: 'unhandled_native_error' });
      sendToWeb(webRef, {
        id: req.id,
        type: 'response',
        ok: false,
        error: shape, // 항상 { code, message, data?, cause? }
        meta: { v: BRIDGE_VERSION, source: 'native', ts: Date.now() },
      });
    }
  };

  /** Native -> Web (event) */
  const sendEvent = (event: string, payload?: unknown) => {
    sendToWeb(webRef, {
      id: `evt-${Date.now()}`,
      type: 'event',
      event,
      payload,
      meta: { v: BRIDGE_VERSION, source: 'native', ts: Date.now() },
    });
  };

  /** 브릿지 준비 및 지원 메서드 목록 통지 */
  const notifyReady = () => {
    sendEvent('bridge.ready', { nativeVersion: BRIDGE_VERSION, methods: router.list() });
  };

  return { onMessage, sendEvent, notifyReady };
}

export type { NativeHandler };
export { NativeBridgeRouter, wireWebView, normalizeError };
