import type { ImagePickerOptions, ImagePickerPayload } from '@/types/image-picker';
import { ActionSheetIOS, Alert, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../api/image';
import * as ImageManipulator from 'expo-image-manipulator';

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const DEFAULT_MAX_SELECTION = 50;

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'heic', 'heif']);
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif']);

type SkipReason = 'invalid_spec' | 'oversized' | 'unreadable';

interface PickedImage {
  uri: string;
  fileName?: string | null;
  mimeType?: string;
  fileSize?: number;
}

const selectImageSource = () =>
  new Promise<'library' | 'files' | null>((resolve) => {
    if (Platform.OS === 'android') {
      Alert.alert(
        '사진 추가',
        undefined,
        [
          { text: '취소', style: 'cancel', onPress: () => resolve(null) },
          { text: '사진 보관함', onPress: () => resolve('library') },
          { text: '파일 찾아보기', onPress: () => resolve('files') },
        ],
        { cancelable: true, onDismiss: () => resolve(null) }
      );
      return;
    }

    ActionSheetIOS.showActionSheetWithOptions(
      { options: ['사진 보관함', '파일 찾아보기', '취소'], cancelButtonIndex: 2 },
      (index) => resolve(index === 0 ? 'library' : index === 1 ? 'files' : null)
    );
  });

function getExtension(fileName?: string | null) {
  if (!fileName) return null;
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? null;
}

function isAllowedFormat(asset: PickedImage) {
  const mimeType = asset.mimeType?.toLowerCase();
  if (mimeType && ALLOWED_MIME_TYPES.has(mimeType)) return true;

  const extension = getExtension(asset.fileName);
  if (extension && ALLOWED_EXTENSIONS.has(extension)) return true;

  // mime/파일명이 없으면 이미지 피커 결과라도 스펙 미충족으로 처리
  return false;
}

async function getAssetSizeBytes(asset: PickedImage) {
  if (typeof asset.fileSize === 'number' && asset.fileSize > 0) return asset.fileSize;

  try {
    const info = await FileSystem.getInfoAsync(asset.uri, { size: true });
    if (info.exists && typeof info.size === 'number') return info.size;
  } catch {
    return null;
  }

  return null;
}

async function validateAsset(asset: PickedImage): Promise<SkipReason | null> {
  if (!isAllowedFormat(asset)) return 'invalid_spec';

  const size = await getAssetSizeBytes(asset);
  if (size == null) return 'unreadable';
  if (size > MAX_FILE_SIZE_BYTES) return 'oversized';

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

async function compressForUpload(asset: PickedImage, targetSizeBytes?: number) {
  if (!targetSizeBytes) {
    const manipulated = await ImageManipulator.manipulateAsync(asset.uri, [{ resize: { width: 1600 } }], {
      compress: 0.75,
      format: ImageManipulator.SaveFormat.JPEG,
    });

    return {
      uri: manipulated.uri,
      mimeType: 'image/jpeg',
    };
  }

  const original = await ImageManipulator.manipulateAsync(asset.uri, [], {
    compress: 1,
    format: ImageManipulator.SaveFormat.JPEG,
  });
  let targetWidth = original.width;
  let quality = 0.8;
  let manipulated = original;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    manipulated = await ImageManipulator.manipulateAsync(asset.uri, [{ resize: { width: targetWidth } }], {
      compress: quality,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    const info = await FileSystem.getInfoAsync(manipulated.uri, { size: true });
    const fileSize = info.exists && typeof info.size === 'number' ? info.size : null;
    if (fileSize !== null && fileSize <= targetSizeBytes) break;

    const scale = fileSize ? Math.min(0.95, Math.sqrt(targetSizeBytes / fileSize) * 0.95) : 0.8;
    targetWidth = Math.max(1, Math.floor(targetWidth * scale));
    quality = Math.max(0.5, quality - 0.1);
  }

  return {
    uri: manipulated.uri,
    mimeType: 'image/jpeg',
  };
}

/** 렌더링한 JPEG만 반환해 원본 EXIF가 전달되지 않게 하고, Android content:// 직접 PUT을 피한다. */
async function prepareSkipUploadAsset(asset: PickedImage, maxBytes?: number) {
  const compressed = await compressForUpload(asset, maxBytes);
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

async function uploadToS3(
  preSignedUrl: string,
  asset: PickedImage,
  resizeThresholdBytes?: number
) {
  const fileSize = await getAssetSizeBytes(asset);
  const shouldResize = resizeThresholdBytes === undefined || (fileSize !== null && fileSize >= resizeThresholdBytes);
  const uploadAsset = shouldResize
    ? await compressForUpload(asset, resizeThresholdBytes)
    : { uri: asset.uri, mimeType: asset.mimeType ?? 'application/octet-stream' };

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
      resizeThresholdBytes,
      aspect,
      allowsMultipleSelection,
      orderedSelection,
      selectionLimit,
      skipUpload = false,
      allowsFileSelection = false,
    } = payload;

    let documentUris: string[] = [];
    try {
      const canSelectFiles = source === 'library' && allowsFileSelection && skipUpload;
      const selectedSource = canSelectFiles ? await selectImageSource() : source;
      if (selectedSource === null) {
        sendEvent('media.pickImage.result', { requestId, cancelled: true });
        return;
      }

      if (source === 'camera') {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.status !== 'granted') {
          sendEvent('media.pickImage.cancel', {
            requestId,
            reason: 'NO_PERMISSION_CAMERA',
          });
          return;
        }
      } else if (Platform.OS === 'ios' && selectedSource === 'library') {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const hasLibraryAccess =
          permissionResult.status === 'granted' ||
          permissionResult.accessPrivileges === 'all' ||
          permissionResult.accessPrivileges === 'limited';

        if (!hasLibraryAccess) {
          sendEvent('media.pickImage.cancel', {
            requestId,
            reason: 'NO_PERMISSION_LIBRARY',
          });
          return;
        }
      }
      // Android library: READ_MEDIA_* 없이 시스템 Photo Picker 사용

      const maxSelection =
        typeof selectionLimit === 'number' && selectionLimit > 0 ? selectionLimit : DEFAULT_MAX_SELECTION;
      const maxPreparedBytes = resizeThresholdBytes ?? (canSelectFiles ? MAX_FILE_SIZE_BYTES : undefined);
      const shouldKeepOriginal = canSelectFiles && Platform.OS === 'ios';

      // 최대 초과 토스트를 위해 피커에서는 제한하지 않고, 이후 잘라냄
      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: allowsEditing ?? false,
        quality: shouldKeepOriginal ? 1 : (quality ?? 0.8),
        preferredAssetRepresentationMode: shouldKeepOriginal
          ? ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Current
          : undefined,
        aspect,
        allowsMultipleSelection: source === 'camera' ? false : (allowsMultipleSelection ?? false),
        orderedSelection: orderedSelection ?? false,
        selectionLimit: 0,
      };

      let pickedAssets: PickedImage[] | null;
      if (selectedSource === 'files') {
        const result = await DocumentPicker.getDocumentAsync({
          type: [...ALLOWED_MIME_TYPES],
          multiple: allowsMultipleSelection ?? false,
          copyToCacheDirectory: true,
        });
        documentUris = result.assets?.map((asset) => asset.uri) ?? [];
        pickedAssets = result.canceled
          ? null
          : result.assets.map(({ uri, name, size, mimeType }) => ({ uri, fileName: name, fileSize: size, mimeType }));
      } else {
        const result =
          selectedSource === 'library'
            ? await ImagePicker.launchImageLibraryAsync(pickerOptions)
            : await ImagePicker.launchCameraAsync(pickerOptions);
        pickedAssets = result.canceled ? null : (result.assets ?? []);
      }

      if (pickedAssets === null) {
        sendEvent('media.pickImage.result', {
          requestId,
          cancelled: true,
        });
        return;
      }

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
      let oversizedCount = 0;
      let unreadableCount = 0;
      let hasNetworkError = false;

      for (const pickedAsset of assetsToUpload) {
        const skipReason = await validateAsset(pickedAsset);
        if (skipReason === 'invalid_spec') {
          invalidSpecCount += 1;
          continue;
        }
        if (skipReason === 'oversized') {
          oversizedCount += 1;
          continue;
        }
        if (skipReason === 'unreadable') {
          unreadableCount += 1;
          continue;
        }

        if (skipUpload) {
          try {
            const prepared = await prepareSkipUploadAsset(pickedAsset, resizeThresholdBytes);
            if (!prepared.fileSize || prepared.fileSize <= 0) {
              unreadableCount += 1;
              continue;
            }
            if (maxPreparedBytes && prepared.fileSize > maxPreparedBytes) {
              oversizedCount += 1;
              continue;
            }
            uploadedAssets.push(prepared);
          } catch (error) {
            console.error('[APP] pickImage skipUpload item error', error);
            unreadableCount += 1;
          }
          continue;
        }

        try {

          const { key, preSignedUrl } = await uploadImage();
          await uploadToS3(preSignedUrl, pickedAsset, resizeThresholdBytes);
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
          skipped: { invalidSpecCount, oversizedCount, unreadableCount },
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
          invalidSpecCount > 0 || oversizedCount > 0 || unreadableCount > 0
            ? { invalidSpecCount, oversizedCount, unreadableCount }
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
    } finally {
      await Promise.allSettled(documentUris.map((uri) => FileSystem.deleteAsync(uri, { idempotent: true })));
    }
  };

  return {
    'media.pickImage': handlePickImage,
  };
}
