import * as ImagePicker from 'expo-image-picker';
import type { RefObject } from 'react';
import type { WebView } from 'react-native-webview';
import type { ImageAsset } from '@knockdog/bridge-core';

interface ImagePickerOptions {
  sendEvent: (event: string, payload?: unknown) => void;
}

/**
 * 이미지 피커 이벤트 핸들러 등록
 */
export function registerImagePickerHandlers(webRef: RefObject<WebView>, options: ImagePickerOptions) {
  const { sendEvent } = options;

  // 단일 이미지 선택 이벤트 핸들러
  const handlePickImage = async (payload: {
    requestId: string;
    mediaTypes?: 'images' | 'videos' | 'all';
    allowsEditing?: boolean;
    quality?: number;
    aspect?: [number, number];
  }) => {
    const { requestId, mediaTypes, allowsEditing, quality, aspect } = payload;

    try {
      // 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        sendEvent('media.pickImage.cancel', {
          requestId,
          reason: '사진 라이브러리 권한이 필요합니다.',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaTypes === 'videos' ? ['videos'] : mediaTypes === 'all' ? ['images', 'videos'] : ['images'],
        allowsEditing: allowsEditing ?? false,
        quality: quality ?? 0.8,
        aspect,
        allowsMultipleSelection: false,
        base64: true, // 웹뷰에서 사용 가능하도록 base64 인코딩
      });

      if (result.canceled) {
        sendEvent('media.pickImage.result', {
          requestId,
          cancelled: true,
        });
        return;
      }

      const assets: ImageAsset[] = result.assets.map((asset) => ({
        uri: asset.base64 ? `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}` : asset.uri,
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize,
        type: asset.type,
        fileName: asset.fileName ?? undefined,
        mimeType: asset.mimeType ?? undefined,
      }));

      sendEvent('media.pickImage.result', {
        requestId,
        cancelled: false,
        assets,
      });
    } catch (error) {
      console.error('[APP] pickImage error', error);
      sendEvent('media.pickImage.cancel', {
        requestId,
        reason: '이미지를 선택할 수 없습니다.',
      });
    }
  };

  // 다중 이미지 선택 이벤트 핸들러
  const handlePickImages = async (payload: {
    requestId: string;
    quality?: number;
    orderedSelection?: boolean;
    selectionLimit?: number;
  }) => {
    const { requestId, quality, orderedSelection, selectionLimit } = payload;

    try {
      // 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        sendEvent('media.pickImages.cancel', {
          requestId,
          reason: '사진 라이브러리 권한이 필요합니다.',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: quality ?? 0.8,
        allowsMultipleSelection: true,
        orderedSelection: orderedSelection ?? false,
        selectionLimit: selectionLimit ?? 0, // 0 = 무제한
        base64: true, // 웹뷰에서 사용 가능하도록 base64 인코딩
      });

      if (result.canceled) {
        sendEvent('media.pickImages.result', {
          requestId,
          cancelled: true,
        });
        return;
      }

      const assets: ImageAsset[] = result.assets.map((asset) => ({
        uri: asset.base64 ? `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}` : asset.uri,
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize,
        type: asset.type,
        fileName: asset.fileName ?? undefined,
        mimeType: asset.mimeType ?? undefined,
      }));

      sendEvent('media.pickImages.result', {
        requestId,
        cancelled: false,
        assets,
      });
    } catch (error) {
      console.error('[APP] pickImages error', error);
      sendEvent('media.pickImages.cancel', {
        requestId,
        reason: '이미지를 선택할 수 없습니다.',
      });
    }
  };

  return {
    'media.pickImage': handlePickImage,
    'media.pickImages': handlePickImages,
  };
}
