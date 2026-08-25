'use client';

import { useEffect, useRef, useState } from 'react';
import { METHODS } from '@knockdog/bridge-core';

import { ownerAlbumContent } from '@views/owner-album-page/config/ownerAlbumContent';

import { useBridge } from '@shared/lib/bridge';
import { isNativeWebView } from '@shared/lib/device';
import { RingLoadingSpinner } from '@shared/ui/loading-spinner';

interface OwnerAlbumUploadModalProps {
  isOpen: boolean;
}

let lastBlockingOverlayRequestId = 0;

function OwnerAlbumUploadModal({ isOpen }: OwnerAlbumUploadModalProps) {
  const bridge = useBridge();
  const hasRequestedNativeOverlay = useRef(false);
  const [isNative, setIsNative] = useState<boolean | null>(null);

  useEffect(() => {
    setIsNative(isNativeWebView());
  }, []);

  useEffect(() => {
    if (!isOpen || !isNative) return;

    hasRequestedNativeOverlay.current = true;
    lastBlockingOverlayRequestId = Math.max(Date.now(), lastBlockingOverlayRequestId + 1);
    void bridge
      .request(METHODS.setBlockingOverlay, {
        visible: true,
        message: ownerAlbumContent.uploadModalMessage,
        requestId: lastBlockingOverlayRequestId,
      })
      .catch(() => undefined);

    return () => {
      if (!hasRequestedNativeOverlay.current) return;

      hasRequestedNativeOverlay.current = false;
      lastBlockingOverlayRequestId = Math.max(Date.now(), lastBlockingOverlayRequestId + 1);
      void bridge
        .request(METHODS.setBlockingOverlay, {
          visible: false,
          message: '',
          requestId: lastBlockingOverlayRequestId,
        })
        .catch(() => undefined);
    };
  }, [bridge, isNative, isOpen]);

  // 환경 판별 전에는 웹 팝업을 렌더링하지 않는다.
  // WebView 주입 시점에 따라 웹/네이티브 팝업이 동시에 나타나는 것을 방지한다.
  if (!isOpen || isNative !== false) return null;

  return (
    <div
      className='fixed inset-0 z-modal flex items-center justify-center bg-[rgb(15,20,26)]/70 px-10'
      role='alertdialog'
      aria-modal='true'
      aria-busy='true'
      aria-label={ownerAlbumContent.uploadModalMessage}
    >
      <div className='radius-r4 bg-bg-0 flex w-full max-w-[280px] flex-col items-center gap-4 px-6 py-8'>
        <RingLoadingSpinner size={40} />
        <p className='body1-bold text-text-primary whitespace-pre-line text-center'>
          {ownerAlbumContent.uploadModalMessage}
        </p>
      </div>
    </div>
  );
}

export { OwnerAlbumUploadModal };
