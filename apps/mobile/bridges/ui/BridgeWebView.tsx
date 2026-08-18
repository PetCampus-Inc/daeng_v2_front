import WebView from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type RefObject, useRef, useMemo, useEffect } from 'react';
import { Platform } from 'react-native';
import { makeOnMessage } from '../lib/onMessage';
import { createBridgeForWebView } from '../wiring/createBridge';
import { buildConsolePatch } from '../lib/consolePatch';
import { navBridgeHub } from '../model/navBridgeHub';
import { pushCoordinator } from '@/lib/pushCoordinator';
import type { InitialState } from '@/types/navigation';
import ErrorScreen from './ErrorScreen';

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
        var __BRIDGE_INITIAL_STATE__ = ${json};
        var hasState = __BRIDGE_INITIAL_STATE__ && (Object.keys(__BRIDGE_INITIAL_STATE__).length > 0);
        if (!hasState) {
          return;
        }

        var url = new URL(window.location.href);
        var sp = new URLSearchParams(url.search);

        // query가 있으면 searchParams를 대체
        if (__BRIDGE_INITIAL_STATE__.query &&
            typeof __BRIDGE_INITIAL_STATE__.query === 'object' &&
            !Array.isArray(__BRIDGE_INITIAL_STATE__.query)) {
          sp = new URLSearchParams();
          Object.keys(__BRIDGE_INITIAL_STATE__.query).forEach(function(k){
            var v = __BRIDGE_INITIAL_STATE__.query[k];
            if (v === null || v === undefined) return;
            sp.set(k, String(v));
          });
        }

        // Next가 history.state를 덮어도 getCurrentTxId가 동작하도록 URL에도 유지
        if (__BRIDGE_INITIAL_STATE__._txId) {
          sp.set('_txId', String(__BRIDGE_INITIAL_STATE__._txId));
        }

        var qs = sp.toString();
        var newHref = url.pathname + (qs ? ('?' + qs) : '') + url.hash;
        history.replaceState(__BRIDGE_INITIAL_STATE__, '', newHref);
      } catch (e) {
        console.error('[BridgeWebView] state 주입 실패:', e);
      }
    })();
  `;
}

/** Safe Area Insets 주입 스크립트 */
function buildSafeAreaInjector(insets: { top: number; bottom: number; left: number; right: number }) {
  const { top, bottom, left, right } = insets;
  return `
    (function(){
      var insets = { top: ${top}, bottom: ${bottom}, left: ${left}, right: ${right} };
      window.__SAFE_AREA_INSETS__ = insets;
      var root = document.documentElement;
      root.setAttribute('data-env', 'webview');
      var style = root.style;
      style.setProperty('--safe-area-inset-top', '${top}px');
      style.setProperty('--safe-area-inset-bottom', '${bottom}px');
      style.setProperty('--safe-area-inset-left', '${left}px');
      style.setProperty('--safe-area-inset-right', '${right}px');
    })();
    true;
  `;
}

export function BridgeWebView({ uri, webviewRef, initialState }: Props) {
  const insets = useSafeAreaInsets();
  const lastInjectedInsetsRef = useRef<string | null>(null);

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

  // Safe Area 주입 스크립트
  const INJECT_SAFE_AREA = useMemo(() => buildSafeAreaInjector(insets), [insets]);

  // 개발 모드에서는 콘솔 패치 + state 주입을 함께, 프로덕션에서도 state 주입은 항상 수행
  const INJECT_BEFORE = useMemo(() => {
    const scripts = [];
    if (__DEV__) scripts.push(CONSOLE_PATCH);
    scripts.push(INJECT_SAFE_AREA);
    scripts.push(INJECT_STATE);
    return scripts.join('\n');
  }, [CONSOLE_PATCH, INJECT_STATE, INJECT_SAFE_AREA]);

  useEffect(() => {
    const ref = refToUse.current;
    if (!ref) return;
    const key = `${insets.top}-${insets.bottom}-${insets.left}-${insets.right}`;
    if (lastInjectedInsetsRef.current === key) return;
    lastInjectedInsetsRef.current = key;
    ref.injectJavaScript(buildSafeAreaInjector(insets));
  }, [insets, refToUse]);

  // unmount 시 이 WebView가 기다리던 모든 txId 정리
  useEffect(() => {
    return () => {
      navBridgeHub.cleanup(refToUse);
      pushCoordinator.removeSessionWebView(refToUse);
    };
  }, [refToUse]);

  return (
    <WebView
      ref={refToUse}
      source={{ uri }}
      onMessage={handleOnMessage}
      onLoadEnd={() => {
        if (Platform.OS === 'android') {
          const ref = refToUse.current;
          if (ref) {
            ref.injectJavaScript(buildSafeAreaInjector(insets));
          }
        }
        notifyReady();
      }}
      javaScriptEnabled
      domStorageEnabled
      originWhitelist={['*']}
      cacheEnabled
      geolocationEnabled
      webviewDebuggingEnabled={__DEV__}
      injectedJavaScriptBeforeContentLoaded={Platform.OS === 'ios' ? INJECT_BEFORE : undefined}
      injectedJavaScript={Platform.OS === 'android' ? INJECT_BEFORE : undefined}
      renderError={() => <ErrorScreen onRefresh={() => {
        refToUse.current?.reload();
      }} />}
    />
  );
}
