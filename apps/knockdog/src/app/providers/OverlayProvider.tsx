'use client';

import { useEffect, useRef } from 'react';
import { overlay, OverlayProvider as OverClientProvider, useCurrentOverlay } from 'overlay-kit';

const OVERLAY_HISTORY_KEY = '__knockdogOverlayId';
const NATIVE_BACK_EVENT = 'knockdog:native-back';

function OverlayBackDismissHandler() {
  const currentOverlayId = useCurrentOverlay();
  const currentOverlayIdRef = useRef(currentOverlayId);
  const previousOverlayIdRef = useRef<string | null>(null);
  const isRestoringPreviousOverlayRef = useRef(false);

  currentOverlayIdRef.current = currentOverlayId;

  useEffect(() => {
    const previousOverlayId = previousOverlayIdRef.current;

    if (previousOverlayId && previousOverlayId !== currentOverlayId) {
      if (window.history.state?.[OVERLAY_HISTORY_KEY] === previousOverlayId) {
        isRestoringPreviousOverlayRef.current = true;
        window.history.back();
      }
    }

    if (
      currentOverlayId &&
      previousOverlayId !== currentOverlayId &&
      !isRestoringPreviousOverlayRef.current &&
      window.history.state?.[OVERLAY_HISTORY_KEY] !== currentOverlayId
    ) {
      window.history.pushState(
        { ...window.history.state, [OVERLAY_HISTORY_KEY]: currentOverlayId },
        '',
        window.location.href
      );
    }

    previousOverlayIdRef.current = currentOverlayId;
  }, [currentOverlayId]);

  useEffect(() => {
    const closeCurrentOverlay = () => {
      const overlayId = currentOverlayIdRef.current;
      if (overlayId) overlay.close(overlayId);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing || !currentOverlayIdRef.current) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      closeCurrentOverlay();
    };

    const handlePopState = () => {
      if (isRestoringPreviousOverlayRef.current) {
        isRestoringPreviousOverlayRef.current = false;
        return;
      }

      if (!currentOverlayIdRef.current) return;

      closeCurrentOverlay();
    };

    const handleNativeBack = (event: Event) => {
      if (!currentOverlayIdRef.current) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      closeCurrentOverlay();
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener(NATIVE_BACK_EVENT, handleNativeBack, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener(NATIVE_BACK_EVENT, handleNativeBack, true);
    };
  }, []);

  return null;
}

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  return (
    <OverClientProvider>
      <OverlayBackDismissHandler />
      {children}
    </OverClientProvider>
  );
}
