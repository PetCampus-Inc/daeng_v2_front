import { METHODS, BridgeException } from '@knockdog/bridge-core';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useBridge } from '@shared/lib/bridge/BridgeProvider';
import { isNativeWebView } from '@shared/lib/device/isNativeWebView';

interface ShareAlbumPhotoParams {
  url: string;
  savingMessage: string;
  sendingMessage: string;
}

function toAbsoluteUrl(url: string) {
  if (/^(https?:)/i.test(url)) return url;
  if (typeof window === 'undefined') return url;

  try {
    return new URL(url, window.location.origin).href;
  } catch {
    return url;
  }
}

function buildProxyDownloadUrl(url: string, fileName: string) {
  const params = new URLSearchParams({ url, fileName });
  return `/api/media/download?${params.toString()}`;
}

async function fetchShareFile(url: string, fileName: string) {
  const absoluteUrl = toAbsoluteUrl(url);
  const sameOrigin =
    typeof window !== 'undefined' &&
    (absoluteUrl.startsWith('/') || new URL(absoluteUrl).origin === window.location.origin);
  const response = await fetch(sameOrigin ? absoluteUrl : buildProxyDownloadUrl(absoluteUrl, fileName));
  if (!response.ok) return null;

  const blob = await response.blob();
  const type = blob.type.startsWith('image/') ? blob.type : 'image/jpeg';
  const extension = type === 'image/png' ? 'png' : 'jpg';
  const name = fileName.replace(/\.[^.]+$/, `.${extension}`);
  return new File([blob], name, { type });
}

function pickWebSharePayload(file: File, absoluteUrl: string): ShareData {
  const withFileAndLink: ShareData = { files: [file], text: absoluteUrl, title: '앨범 사진' };
  const withFile: ShareData = { files: [file] };
  const withLink: ShareData = { url: absoluteUrl, title: '앨범 사진' };

  if (typeof navigator.canShare !== 'function') return withFile;
  if (navigator.canShare(withFileAndLink)) return withFileAndLink;
  if (navigator.canShare(withFile)) return withFile;
  return withLink;
}

function isShareCancel(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}

function needsWebShareFile(url: string | null | undefined) {
  if (!url) return false;
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return false;
  return !isNativeWebView();
}

/** 클릭 턴 안에서 share()를 호출한다. 그 전에 await 하면 사용자 제스처가 끊긴다. */
function shareAlbumPhotoWeb(url: string, file: File | undefined): Promise<boolean> {
  if (!file || typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return Promise.resolve(false);
  }

  const absoluteUrl = toAbsoluteUrl(url);
  let sharePromise: Promise<void>;
  try {
    sharePromise = navigator.share(pickWebSharePayload(file, absoluteUrl));
  } catch (error) {
    if (isShareCancel(error)) return Promise.resolve(true);
    console.error('[WEB] shareAlbumPhoto error', error);
    return Promise.resolve(false);
  }

  return sharePromise.then(
    () => true,
    (error: unknown) => {
      if (isShareCancel(error)) return true;
      console.error('[WEB] shareAlbumPhoto error', error);
      return false;
    }
  );
}

function useShareAlbumPhoto(url: string | null | undefined) {
  const bridge = useBridge();
  const fileCacheRef = useRef(new Map<string, File>());
  const [readyUrl, setReadyUrl] = useState<string | null>(null);
  const absoluteUrl = url ? toAbsoluteUrl(url) : null;
  const isWebShareReady =
    !needsWebShareFile(url) || (absoluteUrl != null && readyUrl === absoluteUrl);

  useEffect(() => {
    if (!absoluteUrl || !needsWebShareFile(url) || readyUrl === absoluteUrl) return;

    let cancelled = false;
    fetchShareFile(absoluteUrl, `album-${Date.now()}.jpg`)
      .then((file) => {
        if (cancelled || !file) return;
        fileCacheRef.current.clear();
        fileCacheRef.current.set(absoluteUrl, file);
        setReadyUrl(absoluteUrl);
      })
      .catch((error: unknown) => {
        console.error('[WEB] shareAlbumPhoto prepare error', error);
      });

    return () => {
      cancelled = true;
    };
  }, [absoluteUrl, readyUrl, url]);

  const shareAlbumPhoto = useCallback(
    async function shareAlbumPhoto(params: ShareAlbumPhotoParams): Promise<boolean> {
      const { url: shareUrl, savingMessage, sendingMessage } = params;
      if (!shareUrl) return false;

      if (isNativeWebView()) {
        try {
          const response = await bridge.request(
            METHODS.shareImage,
            {
              url: toAbsoluteUrl(shareUrl),
              savingMessage,
              sendingMessage,
            },
            { timeoutMs: null }
          );

          return Boolean(response?.shared);
        } catch (error) {
          if (error instanceof BridgeException) {
            console.error(
              '[WEBVIEW] Bridge shareImage error - code:',
              error.code,
              'message:',
              error.message
            );
          } else {
            console.error('[WEBVIEW] Bridge shareImage error', error);
          }

          return false;
        }
      }

      const absoluteUrl = toAbsoluteUrl(shareUrl);
      return shareAlbumPhotoWeb(shareUrl, fileCacheRef.current.get(absoluteUrl));
    },
    [bridge]
  );

  return { shareAlbumPhoto, isWebShareReady };
}

export { useShareAlbumPhoto };
