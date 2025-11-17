import type { ImagePickerOptions, ImagePickerPayload } from '@/types/image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../api/image';

async function uploadToS3(preSignedUrl: string, asset: ImagePicker.ImagePickerAsset) {
  const uploadResult = await FileSystem.uploadAsync(preSignedUrl, asset.uri, {
    httpMethod: 'PUT',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: {
      'Content-Type': asset.mimeType ?? 'application/octet-stream',
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

  // 이미지 선택 이벤트 핸들러
  const handlePickImage = async (payload: ImagePickerPayload) => {
    const {
      requestId,
      mediaTypes,
      allowsEditing,
      quality,
      aspect,
      allowsMultipleSelection,
      orderedSelection,
      selectionLimit,
    } = payload;

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
        allowsMultipleSelection: allowsMultipleSelection ?? false,
        orderedSelection: orderedSelection ?? false,
        selectionLimit: selectionLimit ?? 0, // 0 = 무제한
      });

      if (result.canceled) {
        sendEvent('media.pickImage.result', {
          requestId,
          cancelled: true,
        });
        return;
      }

      const pickedAssets = result.assets ?? [];
      if (pickedAssets.length === 0) {
        throw new Error('선택된 이미지가 없습니다.');
      }

      const uploadedAssets: Array<{ key: string; preSignedUrl: string }> = [];
      for (const pickedAsset of pickedAssets) {
        const { key, preSignedUrl } = await uploadImage();
        await uploadToS3(preSignedUrl, pickedAsset);
        uploadedAssets.push({ key, preSignedUrl });
      }

      sendEvent('media.pickImage.result', {
        requestId,
        cancelled: false,
        assets: uploadedAssets,
      });
    } catch (error) {
      console.error('[APP] pickImage error', error);
      sendEvent('media.pickImage.cancel', {
        requestId,
        reason: '이미지를 선택할 수 없습니다.',
      });
    }
  };

  return {
    'media.pickImage': handlePickImage,
  };
}
