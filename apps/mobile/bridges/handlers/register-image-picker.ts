import type { ImagePickerOptions, ImagePickerPayload } from '@/types/image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../api/image';
import * as ImageManipulator from 'expo-image-manipulator';

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const DEFAULT_MAX_SELECTION = 50;

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'heic', 'heif']);
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif']);

type SkipReason = 'invalid_spec' | 'unreadable';

function getExtension(fileName?: string | null) {
  if (!fileName) return null;
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? null;
}

function isAllowedFormat(asset: ImagePicker.ImagePickerAsset) {
  const mimeType = asset.mimeType?.toLowerCase();
  if (mimeType && ALLOWED_MIME_TYPES.has(mimeType)) return true;

  const extension = getExtension(asset.fileName);
  if (extension && ALLOWED_EXTENSIONS.has(extension)) return true;

  // mime/파일명이 없으면 이미지 피커 결과라도 스펙 미충족으로 처리
  return false;
}

async function getAssetSizeBytes(asset: ImagePicker.ImagePickerAsset) {
  if (typeof asset.fileSize === 'number' && asset.fileSize > 0) return asset.fileSize;

  try {
    const info = await FileSystem.getInfoAsync(asset.uri, { size: true });
    if (info.exists && typeof info.size === 'number') return info.size;
  } catch {
    return null;
  }

  return null;
}

async function validateAsset(asset: ImagePicker.ImagePickerAsset): Promise<SkipReason | null> {
  if (!isAllowedFormat(asset)) return 'invalid_spec';

  const size = await getAssetSizeBytes(asset);
  if (size == null) return 'unreadable';
  if (size > MAX_FILE_SIZE_BYTES) return 'invalid_spec';

  return null;
}

function isNetworkError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('failed to fetch') ||
    message.includes('s3 업로드') ||
    message.includes('status:')
  );
}

async function compressForUpload(asset: ImagePicker.ImagePickerAsset) {
  const targetWidth = 1600;
  const quality = 0.75;

  const manipulated = await ImageManipulator.manipulateAsync(asset.uri, [{ resize: { width: targetWidth } }], {
    compress: quality,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  return {
    uri: manipulated.uri,
    mimeType: 'image/jpeg',
  };
}

/** skipUpload용 — content:// 원본 직접 PUT 시 Android 네이티브 크래시 방지 */
async function prepareSkipUploadAsset(asset: ImagePicker.ImagePickerAsset) {
  const compressed = await compressForUpload(asset);
  const info = await FileSystem.getInfoAsync(compressed.uri, { size: true });
  const fileSize = info.exists && typeof info.size === 'number' ? info.size : undefined;

  const originalName = asset.fileName ?? `album-${Date.now()}.jpg`;
  const baseName = originalName.replace(/\.[^.]+$/, '') || `album-${Date.now()}`;

  return {
    key: '',
    preSignedUrl: compressed.uri,
    uri: compressed.uri,
    fileName: `${baseName}.jpg`,
    mimeType: 'image/jpeg' as const,
    fileSize,
  };
}

async function uploadToS3(preSignedUrl: string, asset: ImagePicker.ImagePickerAsset) {
  const uploadAsset = await compressForUpload(asset);

  const uploadResult = await FileSystem.uploadAsync(preSignedUrl, uploadAsset.uri, {
    httpMethod: 'PUT',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: {
      'Content-Type': uploadAsset.mimeType ?? 'application/octet-stream',
    },
  });

  if (uploadResult.status < 200 || uploadResult.status >= 300) {
    throw new Error(`S3 업로드 실패 (status: ${uploadResult.status})`);
  }
}

/**
 * 이미지 피커 이벤트 핸들러 등록
 */
export function registerImagePickerHandlers(options: ImagePickerOptions) {
  const { sendEvent } = options;

  const handlePickImage = async (payload: ImagePickerPayload) => {
    const {
      source = 'library',
      requestId,
      allowsEditing,
      quality,
      aspect,
      allowsMultipleSelection,
      orderedSelection,
      selectionLimit,
      skipUpload = false,
    } = payload;

    try {
      const permissionResult =
        source === 'library'
          ? await ImagePicker.requestMediaLibraryPermissionsAsync()
          : await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.status !== 'granted') {
        sendEvent('media.pickImage.cancel', {
          requestId,
          reason: source === 'library' ? 'NO_PERMISSION_LIBRARY' : 'NO_PERMISSION_CAMERA',
        });
        return;
      }

      const maxSelection =
        typeof selectionLimit === 'number' && selectionLimit > 0 ? selectionLimit : DEFAULT_MAX_SELECTION;

      // 최대 초과 토스트를 위해 피커에서는 제한하지 않고, 이후 잘라냄
      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: allowsEditing ?? false,
        quality: quality ?? 0.8,
        aspect,
        allowsMultipleSelection: source === 'camera' ? false : (allowsMultipleSelection ?? false),
        orderedSelection: orderedSelection ?? false,
        selectionLimit: 0,
      };

      const result =
        source === 'library'
          ? await ImagePicker.launchImageLibraryAsync(pickerOptions)
          : await ImagePicker.launchCameraAsync(pickerOptions);

      if (result.canceled) {
        sendEvent('media.pickImage.result', {
          requestId,
          cancelled: true,
        });
        return;
      }

      const pickedAssets = result.assets ?? [];
      if (pickedAssets.length === 0) {
        sendEvent('media.pickImage.result', {
          requestId,
          cancelled: false,
          assets: [],
          failure: 'none_valid',
        });
        return;
      }

      const exceededLimit = allowsMultipleSelection === true && pickedAssets.length > maxSelection;
      const assetsToUpload = exceededLimit ? pickedAssets.slice(0, maxSelection) : pickedAssets;

      // skipUpload도 JPEG 캐시 변환이 있어 uploading 이벤트로 로딩 UX 노출
      sendEvent('media.pickImage.uploading', {
        requestId,
        count: assetsToUpload.length,
      });

      const uploadedAssets: Array<{
        key: string;
        preSignedUrl: string;
        uri?: string;
        fileName?: string;
        mimeType?: string;
        fileSize?: number;
      }> = [];
      let invalidSpecCount = 0;
      let unreadableCount = 0;
      let hasNetworkError = false;

      for (const pickedAsset of assetsToUpload) {
        const skipReason = await validateAsset(pickedAsset);
        if (skipReason === 'invalid_spec') {
          invalidSpecCount += 1;
          continue;
        }
        if (skipReason === 'unreadable') {
          unreadableCount += 1;
          continue;
        }

        try {
          if (skipUpload) {
            const prepared = await prepareSkipUploadAsset(pickedAsset);
            if (!prepared.fileSize || prepared.fileSize <= 0) {
              unreadableCount += 1;
              continue;
            }
            uploadedAssets.push(prepared);
            continue;
          }

          const { key, preSignedUrl } = await uploadImage();
          await uploadToS3(preSignedUrl, pickedAsset);
          uploadedAssets.push({ key, preSignedUrl });
        } catch (error) {
          console.error('[APP] pickImage upload item error', error);
          if (isNetworkError(error)) {
            hasNetworkError = true;
          } else {
            unreadableCount += 1;
          }
        }
      }

      if (uploadedAssets.length === 0) {
        sendEvent('media.pickImage.result', {
          requestId,
          cancelled: false,
          assets: [],
          skipped: { invalidSpecCount, unreadableCount },
          failure: hasNetworkError ? 'network' : 'none_valid',
          exceededLimit,
        });
        return;
      }

      const [firstAsset, ...restAssets] = uploadedAssets;
      if (!firstAsset) {
        sendEvent('media.pickImage.result', {
          requestId,
          cancelled: false,
          assets: [],
          skipped: { invalidSpecCount, unreadableCount },
          failure: hasNetworkError ? 'network' : 'none_valid',
          exceededLimit,
        });
        return;
      }

      sendEvent('media.pickImage.result', {
        requestId,
        cancelled: false,
        assets: [firstAsset, ...restAssets],
        skipped:
          invalidSpecCount > 0 || unreadableCount > 0
            ? { invalidSpecCount, unreadableCount }
            : undefined,
        exceededLimit,
      });
    } catch (error) {
      console.error('[APP] pickImage error', error);
      sendEvent('media.pickImage.result', {
        requestId,
        cancelled: false,
        assets: [],
        failure: 'network',
      });
    }
  };

  return {
    'media.pickImage': handlePickImage,
  };
}
