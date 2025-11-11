import { useCallback } from 'react';
import { useBridge } from '@shared/lib/bridge/BridgeProvider';
import type { PickImageParams, PickImageResult, ImageAsset } from '@knockdog/bridge-core';
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

function makeRequestId() {
  return `img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function assertImageFile(file: File) {
  if (!file.type || !file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 업로드할 수 있습니다.');
  }
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

async function createWebImageAsset(file: File): Promise<WebImageAsset> {
  assertImageFile(file);

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

/**
 * 웹 환경에서 이미지 선택
 */
async function pickImageWeb(params?: PickImageParams): Promise<PickImageResult> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';

    // mediaTypes에 따라 accept 설정
    if (params?.mediaTypes === 'videos') {
      input.accept = 'video/*';
    } else if (params?.mediaTypes === 'all') {
      input.accept = 'image/*,video/*';
    } else {
      input.accept = 'image/*';
    }

    // 다중 선택 여부
    input.multiple = params?.allowsMultipleSelection ?? false;

    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const files = target.files;

      if (!files || files.length === 0) {
        resolve({ cancelled: true });
        return;
      }

      try {
        // 다중 선택이 아닌 경우 첫 번째 파일만 사용
        if (!params?.allowsMultipleSelection) {
          const file = files[0];
          if (!file) {
            resolve({ cancelled: true });
            return;
          }
          const asset = await createWebImageAsset(file);
          resolve({
            cancelled: false,
            assets: [asset],
          });
          return;
        }

        // 다중 선택인 경우 selectionLimit 적용
        const limit = params?.selectionLimit ?? 0;
        const filesToProcess = limit > 0 ? Array.from(files).slice(0, limit) : Array.from(files);

        const assets = await Promise.all(filesToProcess.map((file) => createWebImageAsset(file)));

        resolve({
          cancelled: false,
          assets,
        });
      } catch (error) {
        console.error('웹 이미지 업로드 실패:', error);
        resolve({ cancelled: true });
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

function useImagePicker() {
  const bridge = useBridge();

  const pickImage = useCallback(
    async (params?: PickImageParams): Promise<PickImageResult> => {
      // 웹 환경인 경우 fallback 사용
      if (!isNativeWebView()) {
        return pickImageWeb(params);
      }

      const requestId = makeRequestId();

      return new Promise<PickImageResult>((resolve, reject) => {
        // 결과 이벤트 리스너 (1회성)
        const unsubResult = bridge.once('media.pickImage.result', async (payload) => {
          if (payload.requestId === requestId) {
            unsubCancel();
            if (payload.cancelled) {
              resolve({ cancelled: true, assets: [] });
              return;
            }

            if (!payload.assets || payload.assets.length === 0) {
              reject(new Error('이미지가 없습니다.'));
              return;
            }

            try {
              const [firstAsset] = payload.assets ?? [];

              if (!firstAsset) {
                reject(new Error('이미지를 찾을 수 없습니다.'));
                return;
              }

              const assets = await Promise.all(payload.assets.map((asset) => getPreviewImageAsset(asset)));

              resolve({
                cancelled: false,
                assets,
              });
            } catch (error) {
              console.error('이미지 프리뷰 요청 실패', error);
              reject(new Error('이미지 프리뷰 요청 실패'));
            }
          }
        });

        // 취소 이벤트 리스너 (1회성)
        const unsubCancel = bridge.once('media.pickImage.cancel', (payload) => {
          if (payload.requestId === requestId) {
            unsubResult();
            reject(new Error(payload.reason || '이미지 선택이 취소되었습니다.'));
          }
        });

        // 이미지 선택 요청 이벤트 발생
        bridge.emit('media.pickImage', {
          requestId,
          mediaTypes: params?.mediaTypes,
          allowsEditing: params?.allowsEditing,
          quality: params?.quality,
          aspect: params?.aspect,
          allowsMultipleSelection: params?.allowsMultipleSelection,
          orderedSelection: params?.orderedSelection,
          selectionLimit: params?.selectionLimit,
        });
      });
    },
    [bridge]
  );

  return { pickImage };
}

export { useImagePicker };
export type { WebImageAsset };
