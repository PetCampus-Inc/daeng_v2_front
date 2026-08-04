import { useCallback } from 'react';

import { useBridge } from '@shared/lib/bridge/BridgeProvider';
import { isNativeWebView } from '@shared/lib/device/isNativeWebView';
import { METHODS, BridgeException, type SaveImageToGalleryParams } from '@knockdog/bridge-core';

function getExtensionFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
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

async function saveImageWeb(url: string, fileName?: string): Promise<boolean> {
  const resolvedFileName = resolveFileName(url, fileName);

  try {
    const response = await fetch(url);
    if (!response.ok) return false;

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = objectUrl;
    link.download = resolvedFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 0);

    return true;
  } catch (error) {
    console.error('[WEBVIEW] saveImageWeb error', error);
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
            console.error('[WEBVIEW] Bridge saveImage error - code:', error.code, 'message:', error.message);
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
