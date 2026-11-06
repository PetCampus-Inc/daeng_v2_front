'use client';

import { useEffect } from 'react';
import { METHODS } from '@knockdog/bridge-core';

import { useBridge } from '@shared/lib/bridge';
import { isNativeWebView } from '@shared/lib/device';

import { useRequiredTermsConsentOverlayStore } from '../model/requiredTermsConsentOverlayStore';

const TAB_BAR_VISIBLE_RETRY_LIMIT = 3;
const TAB_BAR_VISIBLE_RETRY_DELAY_MS = 250;

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const timer = window.setTimeout(resolve, ms);
    const handleAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };

    signal.addEventListener('abort', handleAbort, { once: true });
  });
}

async function setNativeTabBarVisible({
  bridge,
  visible,
  retries,
  signal,
  requestId,
}: {
  bridge: ReturnType<typeof useBridge>;
  visible: boolean;
  retries: number;
  signal: AbortSignal;
  requestId: number;
}) {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    if (signal.aborted) return;

    try {
      const result = await bridge.request(METHODS.navSetBottomTabBarVisible, { visible, requestId });
      if (signal.aborted) return;
      if (result?.visible === visible) return;
      lastError = new Error(`unexpected visible=${String(result?.visible)}`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < retries) {
      try {
        await wait(TAB_BAR_VISIBLE_RETRY_DELAY_MS, signal);
      } catch {
        return;
      }
    }
  }

  if (!signal.aborted) {
    console.error('[useSyncRequiredTermsOverlay] 하단 탭 표시 상태 동기화 실패', {
      visible,
      lastError,
    });
  }
}

/** 네이티브 탭바 요청은 최신 effect만 유효하다. cleanup restore가 다음 hide를 덮지 않게 공유 abort를 쓴다. */
let latestTabBarRequestAbort: AbortController | null = null;
let lastTabBarVisibilityRequestId = 0;

/** 서로 다른 effect의 요청도 시간순으로 비교할 수 있는 단조 증가 ID를 만든다. */
function getNextTabBarVisibilityRequestId() {
  lastTabBarVisibilityRequestId = Math.max(Date.now(), lastTabBarVisibilityRequestId + 1);
  return lastTabBarVisibilityRequestId;
}

/** 약관 오버레이 노출 중 하단 탭(웹/네이티브)을 숨긴다. */
function useSyncRequiredTermsOverlay(isOpen: boolean) {
  const bridge = useBridge();
  const setBlockingOverlayOpen = useRequiredTermsConsentOverlayStore((state) => state.setBlockingOverlayOpen);

  useEffect(() => {
    latestTabBarRequestAbort?.abort();
    const abortController = new AbortController();
    latestTabBarRequestAbort = abortController;
    setBlockingOverlayOpen(isOpen);

    if (isNativeWebView()) {
      void setNativeTabBarVisible({
        bridge,
        visible: !isOpen,
        retries: isOpen ? TAB_BAR_VISIBLE_RETRY_LIMIT : 1,
        signal: abortController.signal,
        requestId: getNextTabBarVisibilityRequestId(),
      });
    }

    return () => {
      abortController.abort();
      if (latestTabBarRequestAbort === abortController) {
        latestTabBarRequestAbort = null;
      }
      setBlockingOverlayOpen(false);
    };
  }, [bridge, isOpen, setBlockingOverlayOpen]);

  useEffect(() => {
    return () => {
      setBlockingOverlayOpen(false);

      if (!isNativeWebView()) return;

      latestTabBarRequestAbort?.abort();
      const restoreAbortController = new AbortController();
      latestTabBarRequestAbort = restoreAbortController;
      void setNativeTabBarVisible({
        bridge,
        visible: true,
        retries: 1,
        signal: restoreAbortController.signal,
        requestId: getNextTabBarVisibilityRequestId(),
      });
    };
  }, [bridge, setBlockingOverlayOpen]);
}

export { useSyncRequiredTermsOverlay };
