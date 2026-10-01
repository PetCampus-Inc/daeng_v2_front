import { METHODS, BridgeException } from '@knockdog/bridge-core';
import { useCallback } from 'react';

import { useBridge } from '@shared/lib/bridge/BridgeProvider';
import { isNativeWebView } from '@shared/lib/device/isNativeWebView';

type ShareAlbumPhotoPhase = 'saving' | 'sending';

interface ShareAlbumPhotoParams {
  url: string;
  savingMessage: string;
  sendingMessage: string;
  /** 웹 공유 시트용 로딩 문구. 네이티브는 브리지가 오버레이를 직접 바꾼다. */
  onPhase?: (phase: ShareAlbumPhotoPhase | null) => void;
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

async function shareAlbumPhotoWeb({
  url,
  onPhase,
}: ShareAlbumPhotoParams): Promise<boolean> {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return false;

  onPhase?.('saving');

  try {
    const absoluteUrl = toAbsoluteUrl(url);
    const file = await fetchShareFile(absoluteUrl, `album-${Date.now()}.jpg`);
    if (!file) return false;

    onPhase?.(null);

    const payload = pickWebSharePayload(file, absoluteUrl);

    try {
      await navigator.share(payload);
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return true;
      console.error('[WEB] shareAlbumPhoto error', error);
      return false;
    }
  } catch (error) {
    console.error('[WEB] shareAlbumPhoto error', error);
    return false;
  } finally {
    onPhase?.(null);
  }
}

function useShareAlbumPhoto() {
  const bridge = useBridge();

  return useCallback(
    async function shareAlbumPhoto(params: ShareAlbumPhotoParams): Promise<boolean> {
      const { url, savingMessage, sendingMessage } = params;
      if (!url) return false;

      if (isNativeWebView()) {
        try {
          const response = await bridge.request(METHODS.shareImage, {
            url: toAbsoluteUrl(url),
            savingMessage,
            sendingMessage,
          });

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

      return shareAlbumPhotoWeb(params);
    },
    [bridge]
  );
}

export { useShareAlbumPhoto };
export type { ShareAlbumPhotoPhase };
