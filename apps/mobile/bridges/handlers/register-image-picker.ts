import type { ImagePickerOptions, ImagePickerPayload } from '@/types/image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../api/image';
import * as ImageManipulator from 'expo-image-manipulator';

function toMB(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(2);
}

// 너비 기준으로 줄이기 (세로사진/가로사진 상관 없이 비율 유지)
async function compressForUpload(asset: ImagePicker.ImagePickerAsset) {
  // 원본 크기 로그 (선택)
  const originInfo = await FileSystem.getInfoAsync(asset.uri, { size: true });
  if (originInfo.exists && typeof originInfo.size === 'number') {
  }

  // PNG/WEBP도 있을 수 있지만 "사진 업로드"는 JPEG로 통일하면 용량이 크게 줄어드는 경우가 많음
  const targetWidth = 1600; // 보통 1280~1920 사이 추천
  const quality = 0.75; // 0.7~0.85 사이에서 타협

  const manipulated = await ImageManipulator.manipulateAsync(asset.uri, [{ resize: { width: targetWidth } }], {
    compress: quality,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  // 압축본 크기 로그 (선택)
  const compressedInfo = await FileSystem.getInfoAsync(manipulated.uri, { size: true });
  if (compressedInfo.exists && typeof compressedInfo.size === 'number') {
  }

  return {
    uri: manipulated.uri,
    mimeType: 'image/jpeg',
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

  // 이미지 선택 이벤트 핸들러
  const handlePickImage = async (payload: ImagePickerPayload) => {
    const {
      source = 'library',
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

      // 공통 옵션 객체 생성
      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: mediaTypes === 'videos' ? ['videos'] : mediaTypes === 'all' ? ['images', 'videos'] : ['images'],
        allowsEditing: allowsEditing ?? false,
        quality: quality ?? 0.8,
        aspect,
        allowsMultipleSelection: source === 'camera' ? false : (allowsMultipleSelection ?? false),
        orderedSelection: orderedSelection ?? false,
        selectionLimit: selectionLimit ?? 0, // 0 = 무제한
      };

      // 소스에 따라 적절한 함수 호출
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
        throw new Error('선택된 이미지가 없습니다.');
      }

      sendEvent('media.pickImage.uploading', {
        requestId,
        count: pickedAssets.length,
      });

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
