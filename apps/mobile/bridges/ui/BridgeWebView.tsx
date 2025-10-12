import WebView from 'react-native-webview';
import { type RefObject, useRef, useMemo } from 'react';
import { makeOnMessage } from '../lib/onMessage';
import { createBridgeForWebView } from '../wiring/createBridge';
import { buildConsolePatch } from '../lib/consolePatch';
import type { InitialState } from '@/types/navigation';

interface Props {
  uri: string;
  webviewRef?: RefObject<WebView>;
  /** navPush/navReplace/navReset로 받은 state를 주입 */
  initialState?: InitialState;
}

/** 초기 history.state & URL 쿼리 주입 스크립트 */
function buildHistoryStateInjector(state?: InitialState) {
  // 주입할 데이터 직렬화
  const json = JSON.stringify(state ?? {});
  return `
    (function(){
      try {
        var __state = ${json};
        var hasState = __state && (Object.keys(__state).length > 0);
        if (!hasState) return;

        // URL 동기화 (query가 있으면 searchParams를 대체)
        var url = new URL(window.location.href);
        if (__state.query && typeof __state.query === 'object') {
          var sp = new URLSearchParams();
          Object.keys(__state.query).forEach(function(k){
            var v = __state.query[k];
            if (v === null || v === undefined) return; // undefined/null은 쿼리 제외
            sp.set(k, String(v));
          });
          var qs = sp.toString();
          var newHref = url.pathname + (qs ? ('?' + qs) : '') + url.hash;
          // state 주입 + URL 변경
          history.replaceState(__state, '', newHref);
        } else {
          // 쿼리 변경 없으면 URL은 그대로, state만 주입
          history.replaceState(__state, '', window.location.href);
        }
      } catch (e) {
        // 안전하게 무시
      }
    })();
  `;
}

export function BridgeWebView({ uri, webviewRef, initialState }: Props) {
  const CONSOLE_PATCH = useMemo(
    () => buildConsolePatch({ tag: 'WEBVIEW', levels: ['log', 'warn', 'error'], maxLen: 1_000 }),
    []
  );

  const internalRef = useRef<WebView>(null);
  const refToUse = (webviewRef ?? internalRef) as RefObject<WebView>;

  const { onMessage, notifyReady } = useMemo(() => createBridgeForWebView(refToUse), [refToUse]);
  const handleOnMessage = useMemo(() => makeOnMessage(onMessage), [onMessage]);

  // 초기 state/history 주입 스크립트
  const INJECT_STATE = useMemo(() => buildHistoryStateInjector(initialState), [initialState]);

  // 개발 모드에서는 콘솔 패치 + state 주입을 함께, 프로덕션에서도 state 주입은 항상 수행
  const INJECT_BEFORE = useMemo(() => {
    const scripts = [];
    if (__DEV__) scripts.push(CONSOLE_PATCH);
    scripts.push(INJECT_STATE);
    return scripts.join('\n');
  }, [CONSOLE_PATCH, INJECT_STATE]);

  return (
    <WebView
      ref={refToUse}
      source={{ uri }}
      onMessage={handleOnMessage}
      onLoadEnd={notifyReady}
      javaScriptEnabled
      originWhitelist={['*']}
      startInLoadingState
      cacheEnabled={false}
      injectedJavaScriptBeforeContentLoaded={INJECT_BEFORE}
      geolocationEnabled
    />
  );
}
