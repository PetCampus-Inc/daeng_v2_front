import { useCallback } from 'react';
import { useBridge } from '@shared/lib/bridge/BridgeProvider';
import type { PickImageParams, PickImagesParams, PickImageResult, ImageAsset } from '@knockdog/bridge-core';
import { isNativeWebView } from '../device/isNativeWebView';

function makeRequestId() {
  return `img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * 웹/네이티브 호환 ImageAsset
 * formValue: FormData에 바로 넣을 수 있는 값 (File 또는 Blob)
 * fileName: FormData append 시 사용할 파일명
 */
export interface WebImageAsset extends ImageAsset {
  file?: File;
  formValue: File | Blob;
}

/**
 * 웹 환경에서 파일을 이미지 에셋으로 변환
 */
async function fileToImageAsset(file: File, quality?: number): Promise<WebImageAsset> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const img = new Image();

      img.onload = () => {
        resolve({
          uri: base64,
          width: img.width,
          height: img.height,
          fileSize: file.size,
          type: 'image',
          fileName: file.name,
          mimeType: file.type,
          file, // 원본 File
          formValue: file, // FormData에 사용할 값
        });
      };

      img.onerror = () => {
        reject(new Error('이미지를 로드할 수 없습니다.'));
      };

      img.src = base64;
    };

    reader.onerror = () => {
      reject(new Error('파일을 읽을 수 없습니다.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 웹 환경에서 단일 이미지 선택
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

    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) {
        resolve({ cancelled: true });
        return;
      }

      try {
        const asset = await fileToImageAsset(file, params?.quality);
        resolve({
          cancelled: false,
          assets: [asset],
        });
      } catch (error) {
        console.error('이미지 변환 실패:', error);
        resolve({ cancelled: true });
      }
    };

    input.oncancel = () => {
      resolve({ cancelled: true });
    };

    input.click();
  });
}

/**
 * 웹 환경에서 다중 이미지 선택
 */
async function pickImagesWeb(params?: PickImagesParams): Promise<PickImageResult> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;

    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const files = target.files;

      if (!files || files.length === 0) {
        resolve({ cancelled: true });
        return;
      }

      try {
        // selectionLimit 적용
        const limit = params?.selectionLimit ?? 0;
        const filesToProcess = limit > 0 ? Array.from(files).slice(0, limit) : Array.from(files);

        const assets = await Promise.all(
          filesToProcess.map((file) => fileToImageAsset(file, params?.quality))
        );

        resolve({
          cancelled: false,
          assets,
        });
      } catch (error) {
        console.error('이미지 변환 실패:', error);
        resolve({ cancelled: true });
      }
    };

    input.oncancel = () => {
      resolve({ cancelled: true });
    };

    input.click();
  });
}

/**
 * base64 데이터 URL을 Blob으로 변환
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const base64Data = base64.split(',')[1];
  if (!base64Data) {
    throw new Error('Invalid base64 data');
  }
  
  const byteString = atob(base64Data);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type: mimeType });
}

/**
 * ImageAsset에 formValue 추가 (네이티브용)
 * base64 데이터 URL인 경우 Blob으로 변환하여 반환
 */
function addFormValue(asset: any): WebImageAsset {
  const mimeType = asset.mimeType || 'image/jpeg';
  const fileName = asset.fileName || 'image.jpg';
  
  // base64 데이터 URL인 경우 Blob으로 변환
  if (asset.uri && asset.uri.startsWith('data:')) {
    return {
      ...asset,
      formValue: base64ToBlob(asset.uri, mimeType),
    } as WebImageAsset;
  }
  
  // 파일 URI인 경우 (file://) - 현재는 지원하지 않지만 향후 확장 가능
  // React Native에서는 보통 base64로 변환해서 보내주므로 이 케이스는 거의 없음
  throw new Error('Unsupported image URI format. Only base64 data URLs are supported.');
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
        const unsubResult = bridge.once('media.pickImage.result', (payload) => {
          if (payload.requestId === requestId) {
            unsubCancel();
            resolve({
              cancelled: payload.cancelled,
              assets: (payload.assets as any)?.map(addFormValue),
            });
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
        });
      });
    },
    [bridge]
  );

  const pickImages = useCallback(
    async (params?: PickImagesParams): Promise<PickImageResult> => {
      // 웹 환경인 경우 fallback 사용
      if (!isNativeWebView()) {
        return pickImagesWeb(params);
      }

      const requestId = makeRequestId();

      return new Promise<PickImageResult>((resolve, reject) => {
        // 결과 이벤트 리스너 (1회성)
        const unsubResult = bridge.once('media.pickImages.result', (payload) => {
          if (payload.requestId === requestId) {
            unsubCancel();
            resolve({
              cancelled: payload.cancelled,
              assets: (payload.assets as any)?.map(addFormValue),
            });
          }
        });

        // 취소 이벤트 리스너 (1회성)
        const unsubCancel = bridge.once('media.pickImages.cancel', (payload) => {
          if (payload.requestId === requestId) {
            unsubResult();
            reject(new Error(payload.reason || '이미지 선택이 취소되었습니다.'));
          }
        });

        // 이미지 선택 요청 이벤트 발생
        bridge.emit('media.pickImages', {
          requestId,
          quality: params?.quality,
          orderedSelection: params?.orderedSelection,
          selectionLimit: params?.selectionLimit,
        });
      });
    },
    [bridge]
  );

  return { pickImage, pickImages };
}

export { useImagePicker };
