import { useCallback } from 'react';

import type {
  PickImageParams,
  PickImageResult,
  ImageAsset,
  PickImageSkipSummary,
} from '@knockdog/bridge-core';

import { useBridge } from '@shared/lib/bridge/BridgeProvider';
import { isNativeWebView } from '../device/isNativeWebView';
import { getPreviewImage } from './api/getPreviewImage';
import { getUploadImage } from './api/getUploadImage';

interface WebImageAsset extends ImageAsset {
  uri: string;
  width?: number;
  height?: number;
  type?: 'image';
  fileName?: string;
  mimeType?: string;
  file?: File;
  formValue?: File;
  fileSize?: number;
}

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const DEFAULT_MAX_SELECTION = 50;
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'heic', 'heif']);
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif']);

type SkipReason = 'invalid_spec' | 'unreadable';

function makeRequestId() {
  return `img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getExtension(fileName?: string) {
  if (!fileName) return null;
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? null;
}

function isAllowedFormat(file: File) {
  const mimeType = file.type?.toLowerCase();
  if (mimeType && ALLOWED_MIME_TYPES.has(mimeType)) return true;

  const extension = getExtension(file.name);
  if (extension && ALLOWED_EXTENSIONS.has(extension)) return true;

  return false;
}

function validateFile(file: File): SkipReason | null {
  if (!isAllowedFormat(file)) return 'invalid_spec';
  if (file.size > MAX_FILE_SIZE_BYTES) return 'invalid_spec';
  if (file.size <= 0) return 'unreadable';
  return null;
}

function isNetworkError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes('network') ||
    message.includes('failed to fetch') ||
    message.includes('s3 업로드') ||
    message.includes('상태 코드')
  );
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('이미지를 로드할 수 없습니다.'));
    };

    img.src = url;
  });
}

async function uploadFileToS3(uploadUrl: string, file: File) {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`S3 업로드에 실패했습니다. 상태 코드: ${response.status}`);
  }
}

async function createLocalWebImageAsset(file: File): Promise<WebImageAsset> {
  const { width, height } = await getImageDimensions(file);
  const objectUrl = URL.createObjectURL(file);

  return {
    key: '',
    preSignedUrl: objectUrl,
    uri: objectUrl,
    width,
    height,
    type: 'image',
    fileName: file.name,
    mimeType: file.type,
    file,
    formValue: file,
    fileSize: file.size,
  };
}

async function createWebImageAsset(file: File, skipUpload = false): Promise<WebImageAsset> {
  if (skipUpload) return createLocalWebImageAsset(file);

  const { width, height } = await getImageDimensions(file);
  const uploadInfo = await getUploadImage();

  await uploadFileToS3(uploadInfo.preSignedUrl, file);

  const previewAsset = await getPreviewImageAsset({ key: uploadInfo.key, preSignedUrl: uploadInfo.preSignedUrl });

  return {
    ...previewAsset,
    uri: previewAsset.preSignedUrl,
    width,
    height,
    type: 'image',
    fileName: file.name,
    mimeType: file.type,
    file,
    formValue: file,
    fileSize: file.size,
  };
}

async function getPreviewImageAsset(asset: ImageAsset): Promise<WebImageAsset> {
  const { data } = await getPreviewImage(asset.key);

  if (!data) {
    throw new Error('이미지 프리뷰 정보를 가져오지 못했습니다.');
  }

  return {
    preSignedUrl: data.preSignedUrl,
    uri: data.preSignedUrl,
    key: data.key,
  };
}

async function uploadFilesWithValidation(
  files: File[],
  options?: { onUploading?: (count: number) => void; skipUpload?: boolean }
): Promise<Extract<PickImageResult, { cancelled: false }>> {
  if (!options?.skipUpload) {
    options?.onUploading?.(files.length);
  }

  const uploadedAssets: WebImageAsset[] = [];
  let invalidSpecCount = 0;
  let unreadableCount = 0;
  let hasNetworkError = false;

  for (const file of files) {
    const skipReason = validateFile(file);
    if (skipReason === 'invalid_spec') {
      invalidSpecCount += 1;
      continue;
    }
    if (skipReason === 'unreadable') {
      unreadableCount += 1;
      continue;
    }

    try {
      const asset = await createWebImageAsset(file, options?.skipUpload);
      uploadedAssets.push(asset);
    } catch (error) {
      console.error('웹 이미지 업로드 실패:', error);
      if (isNetworkError(error)) {
        hasNetworkError = true;
      } else {
        unreadableCount += 1;
      }
    }
  }

  const skipped: PickImageSkipSummary | undefined =
    invalidSpecCount > 0 || unreadableCount > 0
      ? { invalidSpecCount, unreadableCount }
      : undefined;

  if (uploadedAssets.length === 0) {
    return {
      cancelled: false,
      assets: [],
      skipped,
      failure: hasNetworkError ? 'network' : 'none_valid',
    };
  }

  const [firstAsset, ...restAssets] = uploadedAssets;
  if (!firstAsset) {
    return {
      cancelled: false,
      assets: [],
      skipped,
      failure: hasNetworkError ? 'network' : 'none_valid',
    };
  }

  return {
    cancelled: false,
    assets: [firstAsset, ...restAssets],
    skipped,
  };
}

/**
 * 웹 환경에서 이미지 선택
 */
async function pickImageWeb(
  params?: PickImageParams,
  options?: { onUploading?: (count: number) => void }
): Promise<PickImageResult> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve({ cancelled: true });
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/heic,image/heif,.jpg,.jpeg,.png,.heic,.heif';
    input.multiple = params?.allowsMultipleSelection ?? false;

    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const files = target.files;

      if (!files || files.length === 0) {
        resolve({ cancelled: true });
        return;
      }

      try {
        const limit =
          typeof params?.selectionLimit === 'number' && params.selectionLimit > 0
            ? params.selectionLimit
            : DEFAULT_MAX_SELECTION;

        const uploadOptions = { ...options, skipUpload: params?.skipUpload };

        if (!params?.allowsMultipleSelection) {
          const file = files[0];
          if (!file) {
            resolve({ cancelled: true });
            return;
          }
          const result = await uploadFilesWithValidation([file], uploadOptions);
          resolve(result);
          return;
        }

        const selectedFiles = Array.from(files);
        const exceededLimit = selectedFiles.length > limit;
        const filesToProcess = exceededLimit ? selectedFiles.slice(0, limit) : selectedFiles;
        const result = await uploadFilesWithValidation(filesToProcess, uploadOptions);

        resolve({
          ...result,
          exceededLimit,
        });
      } catch (error) {
        console.error('웹 이미지 업로드 실패:', error);
        resolve({
          cancelled: false,
          assets: [],
          failure: 'network',
        });
      } finally {
        input.value = '';
        input.onchange = null;
        input.remove();
      }
    };

    input.oncancel = () => {
      resolve({ cancelled: true });
      input.value = '';
      input.onchange = null;
      input.remove();
    };

    input.click();
  });
}

interface PickImageOptions {
  /** 피커 확정 후 S3 업로드 시작 시 호출 (업로드 모달용) */
  onUploading?: (count: number) => void;
}

function useImagePicker() {
  const bridge = useBridge();

  const pickImage = useCallback(
    async (params?: PickImageParams, options?: PickImageOptions): Promise<PickImageResult> => {
      if (!isNativeWebView()) {
        return pickImageWeb(params, options);
      }

      const requestId = makeRequestId();

      return new Promise<PickImageResult>((resolve, reject) => {
        const unsubUploading = bridge.on('media.pickImage.uploading', (payload) => {
          if (payload.requestId === requestId) {
            options?.onUploading?.(payload.count);
          }
        });

        const unsubResult = bridge.once('media.pickImage.result', async (payload) => {
          if (payload.requestId !== requestId) return;

          unsubCancel();
          unsubUploading();

          if (payload.cancelled) {
            resolve({ cancelled: true });
            return;
          }

          const skipped = payload.skipped;
          const failure = payload.failure;
          const exceededLimit = payload.exceededLimit;

          if (!payload.assets || payload.assets.length === 0) {
            resolve({
              cancelled: false,
              assets: [],
              skipped,
              failure: failure ?? 'none_valid',
              exceededLimit,
            });
            return;
          }

          if (params?.skipUpload) {
            const [firstAsset, ...restAssets] = payload.assets;
            if (!firstAsset) {
              resolve({
                cancelled: false,
                assets: [],
                skipped,
                failure: 'none_valid',
                exceededLimit,
              });
              return;
            }

            resolve({
              cancelled: false,
              assets: [firstAsset, ...restAssets],
              skipped,
              exceededLimit,
            });
            return;
          }

          try {
            const previewAssets = await Promise.all(payload.assets.map((asset) => getPreviewImageAsset(asset)));
            const [firstAsset, ...restAssets] = previewAssets;

            if (!firstAsset) {
              resolve({
                cancelled: false,
                assets: [],
                skipped,
                failure: 'none_valid',
                exceededLimit,
              });
              return;
            }

            resolve({
              cancelled: false,
              assets: [firstAsset, ...restAssets],
              skipped,
              exceededLimit,
            });
          } catch (error) {
            console.error('이미지 프리뷰 요청 실패', error);
            resolve({
              cancelled: false,
              assets: [],
              skipped,
              failure: 'network',
              exceededLimit,
            });
          }
        });

        const unsubCancel = bridge.once('media.pickImage.cancel', (payload) => {
          if (payload.requestId === requestId) {
            unsubResult();
            unsubUploading();
            reject(payload.reason || '이미지 선택이 취소되었습니다.');
          }
        });

        bridge.emit('media.pickImage', {
          source: params?.source,
          requestId,
          mediaTypes: params?.mediaTypes,
          allowsEditing: params?.allowsEditing,
          quality: params?.quality,
          aspect: params?.aspect,
          allowsMultipleSelection: params?.allowsMultipleSelection,
          orderedSelection: params?.orderedSelection,
          selectionLimit: params?.selectionLimit,
          skipUpload: params?.skipUpload,
        });
      });
    },
    [bridge]
  );

  return { pickImage };
}

export { useImagePicker };
export type { WebImageAsset, PickImageOptions };
