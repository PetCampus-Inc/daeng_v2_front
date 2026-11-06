import { METHODS, BridgeException, type SaveImageToGalleryParams } from '@knockdog/bridge-core';
import { useCallback } from 'react';

import { useBridge } from '@shared/lib/bridge/BridgeProvider';
import { isNativeWebView } from '@shared/lib/device/isNativeWebView';

function getExtensionFromUrl(url: string) {
  try {
    const pathname = new URL(url, typeof window !== 'undefined' ? window.location.origin : undefined)
      .pathname;
    const match = pathname.match(/\.(jpe?g|png|webp|heic|heif)$/i);
    return match?.[1]?.toLowerCase() ?? 'jpg';
  } catch {
    return 'jpg';
  }
}

function resolveFileName(url: string, fileName?: string) {
  if (fileName && fileName.trim().length > 0) return fileName.trim();
  return `knockdog-${Date.now()}.${getExtensionFromUrl(url)}`;
}

function buildProxyDownloadUrl(url: string, fileName: string) {
  const params = new URLSearchParams({
    url,
    fileName,
  });
  return `/api/media/download?${params.toString()}`;
}

function isSameOriginUrl(url: string) {
  if (typeof window === 'undefined') return false;
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  if (url.startsWith('blob:') || url.startsWith('data:')) return true;

  try {
    return new URL(url, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
}

function triggerAnchorDownload(href: string, fileName: string) {
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  // same-origin blob/proxy 에서만 download가 동작. 새 탭 이동 방지
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function downloadBlob(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob);
  triggerAnchorDownload(objectUrl, fileName);
  setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 0);
}

async function fetchAsBlob(url: string) {
  const response = await fetch(url);
  if (!response.ok) return null;
  return response.blob();
}

/**
 * 웹 이미지 저장
 * - same-origin / 상대경로 / blob·data URL → 직접 fetch 후 다운로드
 * - 외부(S3 등) → `/api/media/download` 프록시로 CORS 우회
 */
async function saveImageWeb(url: string, fileName?: string): Promise<boolean> {
  const resolvedFileName = resolveFileName(url, fileName);

  try {
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      triggerAnchorDownload(url, resolvedFileName);
      return true;
    }

    if (isSameOriginUrl(url)) {
      const blob = await fetchAsBlob(url);
      if (!blob) return false;
      await downloadBlob(blob, resolvedFileName);
      return true;
    }

    const proxyUrl = buildProxyDownloadUrl(url, resolvedFileName);
    const proxiedBlob = await fetchAsBlob(proxyUrl);
    if (proxiedBlob) {
      await downloadBlob(proxiedBlob, resolvedFileName);
      return true;
    }

    // 프록시 실패 시 CORS 허용 이미지에 한해 직접 다운로드 시도
    const directBlob = await fetchAsBlob(url);
    if (!directBlob) return false;
    await downloadBlob(directBlob, resolvedFileName);
    return true;
  } catch (error) {
    console.error('[WEB] saveImageWeb error', error);
    return false;
  }
}

function useSaveImage() {
  const bridge = useBridge();

  return useCallback(
    async function saveImage(params: SaveImageToGalleryParams): Promise<boolean> {
      const { url, fileName } = params;

      if (!url || url.length === 0) return false;

      if (isNativeWebView()) {
        try {
          const response = await bridge.request<{ saved: boolean }>(METHODS.saveImageToGallery, {
            url,
            fileName,
          });

          return Boolean(response?.saved);
        } catch (error) {
          if (error instanceof BridgeException) {
            console.error(
              '[WEBVIEW] Bridge saveImage error - code:',
              error.code,
              'message:',
              error.message
            );
          } else {
            console.error('[WEBVIEW] Bridge saveImage error', error);
          }

          return false;
        }
      }

      return saveImageWeb(url, fileName);
    },
    [bridge]
  );
}

export { useSaveImage };
