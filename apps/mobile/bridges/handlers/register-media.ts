import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import type { NativeBridgeRouter } from '@knockdog/bridge-native';
import { METHODS, type SaveImageToGalleryParams } from '@knockdog/bridge-core';

function getExtensionFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.(jpe?g|png|webp|heic|heif)$/i);
    return match?.[1]?.toLowerCase() ?? 'jpg';
  } catch {
    return 'jpg';
  }
}

function sanitizeFileName(fileName: string) {
  const baseName = fileName.replace(/\\/g, '/').split('/').pop()?.trim() || '';
  const safeName = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return safeName.length > 0 ? safeName : `knockdog-${Date.now()}.jpg`;
}

function resolveFileName(url: string, fileName?: string) {
  if (fileName && fileName.trim().length > 0) return sanitizeFileName(fileName);
  return `knockdog-${Date.now()}.${getExtensionFromUrl(url)}`;
}

/**
 * 갤러리 저장 핸들러
 */
export function registerMediaHandlers(router: NativeBridgeRouter) {
  router.register(METHODS.saveImageToGallery, async (params: SaveImageToGalleryParams) => {
    const { url, fileName } = params;

    if (!url || typeof url !== 'string') {
      throw { code: 'EINVALID', message: '저장할 이미지 URL이 유효하지 않습니다.' };
    }

    const permission = await MediaLibrary.requestPermissionsAsync(true);
    if (!permission.granted) {
      throw { code: 'EUNAVAILABLE', message: '사진첩 저장 권한이 없습니다.' };
    }

    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) {
      throw { code: 'EUNAVAILABLE', message: '임시 저장 공간을 사용할 수 없습니다.' };
    }

    const tempDir = `${cacheDir}album-save/`;
    const targetFileName = resolveFileName(url, fileName);
    const localUri = `${tempDir}${targetFileName}`;

    try {
      await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });

      const download = await FileSystem.downloadAsync(url, localUri);
      if (download.status < 200 || download.status >= 300) {
        throw { code: 'EUNAVAILABLE', message: '이미지를 다운로드하지 못했습니다.' };
      }

      await MediaLibrary.saveToLibraryAsync(download.uri);
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
}
