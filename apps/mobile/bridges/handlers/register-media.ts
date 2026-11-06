import { AppState, Platform, Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import type { NativeBridgeRouter } from '@knockdog/bridge-native';
import {
  METHODS,
  type PutFileToPresignedUrlParams,
  type SaveImageToGalleryParams,
  type ShareImageParams,
} from '@knockdog/bridge-core';
import { useBlockingOverlayStore } from '@/features/blocking-overlay';

function getExtensionFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.(jpe?g|png|webp|heic|heif)$/i);
    return match?.[1]?.toLowerCase() ?? 'jpg';
  } catch {
    return 'jpg';
  }
}

const MIME_EXTENSION_MAP: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

/**
 * data:<mime>;base64,<payload> 형태의 URL을 파싱. 클라이언트에서 canvas로 즉석 생성한 이미지(QR 등) 저장용.
 * MIME_EXTENSION_MAP에 없는 타입이거나 payload가 비어있으면 지원하지 않는 것으로 간주해 null 반환.
 */
function parseDataUrl(url: string): { mime: string; base64: string } | null {
  const match = /^data:([^;,]+)?;base64,(.*)$/s.exec(url);
  if (!match) return null;

  const mime = (match[1] || 'image/png').toLowerCase();
  const base64 = match[2];
  if (!base64 || !(mime in MIME_EXTENSION_MAP)) return null;

  return { mime, base64 };
}

function sanitizeFileName(fileName: string) {
  const baseName = fileName.replace(/\\/g, '/').split('/').pop()?.trim() || '';
  const safeName = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');

  if (!safeName || safeName === '.' || safeName === '..' || /^\.+$/.test(safeName)) {
    return `knockdog-${Date.now()}.jpg`;
  }

  return safeName;
}

function resolveFileName(url: string, fileName?: string, dataUrl?: { mime: string } | null) {
  if (fileName && fileName.trim().length > 0) return sanitizeFileName(fileName);
  const extension = dataUrl ? (MIME_EXTENSION_MAP[dataUrl.mime] ?? 'png') : getExtensionFromUrl(url);
  return `knockdog-${Date.now()}.${extension}`;
}

const SHARE_FILE_CLEANUP_DELAY_MS = 60_000;
const SHARE_HANDOFF_TIMEOUT_MS = 1500;

function scheduleFileCleanup(uris: string[]) {
  const uniqueUris = [...new Set(uris)];
  setTimeout(() => {
    uniqueUris.forEach((uri) => {
      void FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined);
    });
  }, SHARE_FILE_CLEANUP_DELAY_MS);
}

function extensionFromUri(uri: string) {
  const match = uri.match(/\.([a-z0-9]+)$/i);
  const extension = match?.[1]?.toLowerCase() ?? '';
  return extension === 'jpeg' ? 'jpg' : extension;
}

function shareMimeType(uri: string) {
  const extension = extensionFromUri(uri);
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  return 'image/jpeg';
}

function readContentType(headers: Record<string, string | null> | undefined) {
  if (!headers) return undefined;
  const value = Object.entries(headers).find(([key]) => key.toLowerCase() === 'content-type')?.[1];
  return value ?? undefined;
}

function toDownloadUrl(url: string) {
  if (!/[^\u0000-\u007F]/.test(url)) return url;
  return new URL(url).href;
}

async function alignShareFile(localUri: string, contentType?: string) {
  const mime = contentType?.split(';')[0]?.trim().toLowerCase() ?? '';
  const extension = MIME_EXTENSION_MAP[mime];
  if (!extension || extension === extensionFromUri(localUri)) return localUri;

  const renamed = localUri.replace(/\.[^.]+$/, `.${extension === 'jpeg' ? 'jpg' : extension}`);
  if (renamed === localUri) return localUri;
  await FileSystem.moveAsync({ from: localUri, to: renamed });
  return renamed;
}

function setShareOverlay(visible: boolean, message = '') {
  useBlockingOverlayStore.getState().setUploadOverlay(visible, visible ? message : '');
}

/** 복사·에어드롭처럼 앱을 벗어나지 않는 공유는 전송 로딩을 띄우지 않는다. */
function isLocalShareActivity(activityType?: string | null) {
  if (!activityType) return false;
  const value = activityType.toLowerCase();
  return ['copy', 'savetocameraroll', 'airdrop', 'print', 'markup', 'addtoreadinglist', 'assign'].some((token) =>
    value.includes(token)
  );
}

function waitForShareHandoff() {
  return new Promise<void>((resolve) => {
    if (AppState.currentState === 'background') {
      resolve();
      return;
    }

    const timeout = setTimeout(finish, SHARE_HANDOFF_TIMEOUT_MS);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') finish();
    });

    function finish() {
      clearTimeout(timeout);
      subscription.remove();
      resolve();
    }
  });
}

/**
 * OS 공유 시트는 시스템이 그린다.
 * 전송 로딩은 시트가 닫힌 뒤, 카톡·문자 등으로 넘기는 동안에만 띄운다.
 */
async function presentAlbumShare(shareUri: string, sendingMessage: string) {
  let handedOff = false;
  const subscription = AppState.addEventListener('change', (state) => {
    if (state !== 'background') return;
    handedOff = true;
    setShareOverlay(true, sendingMessage);
  });

  try {
    if (Platform.OS === 'ios') {
      try {
        const result = await Share.share({ url: shareUri } as Parameters<typeof Share.share>[0]);

        if (result.action !== Share.sharedAction) return true;
        if (handedOff || isLocalShareActivity(result.activityType)) return true;

        setShareOverlay(true, sendingMessage);
        await waitForShareHandoff();
        return true;
      } catch (error) {
        console.error('[APP] ios share sheet error', error);
        const mimeType = shareMimeType(shareUri);
        await Sharing.shareAsync(shareUri, {
          mimeType,
          ...(mimeType === 'image/png' ? { UTI: 'public.png' } : { UTI: 'public.jpeg' }),
        });
        return true;
      }
    }

    const mimeType = shareMimeType(shareUri);
    await Sharing.shareAsync(shareUri, {
      mimeType,
      ...(mimeType === 'image/png'
        ? { UTI: 'public.png' }
        : mimeType === 'image/jpeg'
          ? { UTI: 'public.jpeg' }
          : {}),
    });
    return true;
  } finally {
    subscription.remove();
  }
}

function assertSupportedImageUrl(url: string, dataUrl: { mime: string; base64: string } | null) {
  if (!url || typeof url !== 'string') {
    throw { code: 'EINVALID', message: '저장할 이미지 URL이 유효하지 않습니다.' };
  }

  // data: URL(클라이언트에서 생성한 이미지)은 base64 페이로드만 있으면 통과
  if (dataUrl) return;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw { code: 'EINVALID', message: '저장할 이미지 URL이 유효하지 않습니다.' };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw { code: 'EINVALID', message: '저장할 이미지 URL이 유효하지 않습니다.' };
  }
}

/**
 * 갤러리 저장 + presigned PUT 핸들러
 */
export function registerMediaHandlers(router: NativeBridgeRouter) {
  router.register(METHODS.saveImageToGallery, async (params: SaveImageToGalleryParams) => {
    const { url, fileName } = params;
    const dataUrl = typeof url === 'string' ? parseDataUrl(url) : null;

    assertSupportedImageUrl(url, dataUrl);

    const currentPermission = await MediaLibrary.getPermissionsAsync(true);
    const permission = currentPermission.granted
      ? currentPermission
      : await MediaLibrary.requestPermissionsAsync(true);
    if (!permission.granted) {
      throw { code: 'EUNAVAILABLE', message: '사진첩 저장 권한이 없습니다.' };
    }

    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) {
      throw { code: 'EUNAVAILABLE', message: '임시 저장 공간을 사용할 수 없습니다.' };
    }

    const tempDir = `${cacheDir}album-save/`;
    const targetFileName = resolveFileName(url, fileName, dataUrl);
    // 동시 저장 요청이 같은 파일명(예: QR의 고정 fileName)을 써도 경로가 겹치지 않도록 요청별 접두사 부여
    const localUri = `${tempDir}${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${targetFileName}`;

    try {
      await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });

      if (dataUrl) {
        await FileSystem.writeAsStringAsync(localUri, dataUrl.base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else {
        const download = await FileSystem.downloadAsync(url, localUri);
        if (download.status < 200 || download.status >= 300) {
          throw { code: 'EUNAVAILABLE', message: '이미지를 다운로드하지 못했습니다.' };
        }
      }

      await MediaLibrary.saveToLibraryAsync(localUri);
      return { saved: true };
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }

      console.error('[APP] saveImageToGallery error', error);
      throw { code: 'EUNAVAILABLE', message: '사진을 갤러리에 저장하지 못했습니다.' };
    } finally {
      await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(() => undefined);
    }
  });

  router.register(METHODS.shareImage, async (params: ShareImageParams) => {
    const { url, savingMessage, sendingMessage } = params;
    assertSupportedImageUrl(url, null);

    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) {
      throw { code: 'EUNAVAILABLE', message: '임시 저장 공간을 사용할 수 없습니다.' };
    }

    const tempDir = `${cacheDir}album-share/`;
    const localUri = `${tempDir}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    let shareUri = localUri;

    setShareOverlay(true, savingMessage);

    try {
      await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });

      const download = await FileSystem.downloadAsync(toDownloadUrl(url), localUri);
      if (download.status < 200 || download.status >= 300) {
        throw { code: 'EUNAVAILABLE', message: '이미지를 다운로드하지 못했습니다.' };
      }

      const info = await FileSystem.getInfoAsync(localUri, { size: true });
      if (!info.exists || !info.size) {
        throw { code: 'EUNAVAILABLE', message: '이미지를 다운로드하지 못했습니다.' };
      }

      shareUri = await alignShareFile(localUri, readContentType(download.headers));

      if (Platform.OS !== 'ios') {
        const canShare = await Sharing.isAvailableAsync();
        if (!canShare) {
          throw { code: 'EUNAVAILABLE', message: '이 기기에서 공유할 수 없습니다.' };
        }
      }

      // OS 공유 시트는 시스템이 그린다. 앱 로딩이 시트를 가리지 않게 먼저 내린다.
      setShareOverlay(false);

      const shared = await presentAlbumShare(shareUri, sendingMessage);
      return { shared };
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }

      console.error('[APP] shareImage error', error);
      throw { code: 'EUNAVAILABLE', message: '사진을 공유하지 못했습니다.' };
    } finally {
      setShareOverlay(false);
      scheduleFileCleanup([localUri, shareUri]);
    }
  });

  router.register(METHODS.putFileToPresignedUrl, async (params: PutFileToPresignedUrlParams) => {
    const { uri, uploadUrl, contentType } = params;

    if (!uri || !uploadUrl) {
      throw { code: 'EINVALID', message: '업로드 대상이 유효하지 않습니다.' };
    }

    let localUri = uri;
    let shouldCleanup = false;

    try {
      // Android content:// 직접 uploadAsync → 프로세스 크래시 가능. file://로 복사 후 PUT
      if (!uri.startsWith('file://')) {
        const cacheDir = FileSystem.cacheDirectory;
        if (!cacheDir) {
          throw { code: 'EUNAVAILABLE', message: '임시 저장 공간을 사용할 수 없습니다.' };
        }

        const tempDir = `${cacheDir}album-put/`;
        await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });
        localUri = `${tempDir}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.bin`;
        await FileSystem.copyAsync({ from: uri, to: localUri });
        shouldCleanup = true;
      }

      const info = await FileSystem.getInfoAsync(localUri);
      if (!info.exists) {
        throw { code: 'EINVALID', message: '업로드할 파일을 찾을 수 없습니다.' };
      }

      // Content-Type 누락 시 S3가 application/octet-stream으로 저장 → commit 검증 실패
      const resolvedContentType =
        contentType && contentType.trim().length > 0 ? contentType.trim() : 'image/jpeg';

      const uploadResult = await FileSystem.uploadAsync(uploadUrl, localUri, {
        httpMethod: 'PUT',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: {
          'Content-Type': resolvedContentType,
        },
      });

      if (uploadResult.status < 200 || uploadResult.status >= 300) {
        console.error('[APP] putFileToPresignedUrl status', {
          status: uploadResult.status,
          body: uploadResult.body?.slice?.(0, 200),
          contentType: resolvedContentType,
        });
        throw { code: 'EUNAVAILABLE', message: `S3 업로드 실패 (status: ${uploadResult.status})` };
      }

      return { ok: true };
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }

      console.error('[APP] putFileToPresignedUrl error', error);
      throw { code: 'EUNAVAILABLE', message: 'S3 업로드에 실패했습니다.' };
    } finally {
      if (shouldCleanup) {
        await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(() => undefined);
      }
    }
  });
}
