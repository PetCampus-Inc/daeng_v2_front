'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { uploadInquiryPhotos, type InquiryPhoto, type InquiryPickAsset } from '../lib/uploadInquiryPhotos';

import { INQUIRY_IMAGE_MAX_COUNT } from '@entities/inquiry';
import { useImagePicker } from '@shared/lib/media';
import { COMMON_ERROR_TOAST_MESSAGE, toast } from '@shared/ui/toast';

const INVALID_PHOTO_MESSAGE = '사진의 형식과 크기를 확인해 주세요.';
/** PRD에 없는 임시 문구 (OQ-X2) */
const MAX_PHOTO_COUNT_MESSAGE = `사진은 최대 ${INQUIRY_IMAGE_MAX_COUNT}장까지 올릴 수 있어요`;

function revokePreview(photo: InquiryPhoto) {
  if (photo.previewUrl.startsWith('blob:')) URL.revokeObjectURL(photo.previewUrl);
}

/** 문의 사진 상태: 앨범에서 고르면 바로 업로드하고, 업로드한 사진만 목록에 남긴다 (최대 5장) */
function useInquiryPhotos() {
  const { pickImage } = useImagePicker();
  const [photos, setPhotos] = useState<InquiryPhoto[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const isBusyRef = useRef(false);
  const photosRef = useRef(photos);
  photosRef.current = photos;

  useEffect(() => () => photosRef.current.forEach(revokePreview), []);

  const remainingCount = INQUIRY_IMAGE_MAX_COUNT - photos.length;

  const addPhotos = useCallback(async () => {
    if (isBusyRef.current || remainingCount <= 0) return;
    isBusyRef.current = true;

    try {
      // 남은 장수까지만 고를 수 있게 제한한다 (PRD OQ-X2)
      const result = await pickImage({
        source: 'library',
        mediaTypes: 'images',
        allowsMultipleSelection: true,
        orderedSelection: true,
        selectionLimit: remainingCount,
        skipUpload: true,
      });
      if (result.cancelled) return;

      const skippedCount =
        (result.skipped?.invalidSpecCount ?? 0) +
        (result.skipped?.oversizedCount ?? 0) +
        (result.skipped?.unreadableCount ?? 0);
      // Android 사진 선택기는 selectionLimit을 넘겨 고를 수 있어 앱이 앞에서부터 남은 장수만 남긴다. 빠진 사진이 있다고 알린다
      if (result.exceededLimit) toast(MAX_PHOTO_COUNT_MESSAGE);
      else if (skippedCount > 0) toast(INVALID_PHOTO_MESSAGE);

      const assets = (result.assets ?? []).slice(0, remainingCount) as InquiryPickAsset[];
      if (assets.length === 0) return;

      setUploadingCount(assets.length);
      const { uploaded, failedCount, invalidSpecCount } = await uploadInquiryPhotos(assets);
      setPhotos((current) => [...current, ...uploaded].slice(0, INQUIRY_IMAGE_MAX_COUNT));
      // 실패 문구는 PRD에 없는 임시 문구 (OQ-X23)
      if (failedCount > 0) {
        toast(invalidSpecCount === failedCount ? INVALID_PHOTO_MESSAGE : `사진 ${failedCount}장을 올리지 못했어요.`);
      }
    } catch (error) {
      if (error === 'NO_PERMISSION_LIBRARY' || error === 'NO_PERMISSION_CAMERA') return;
      toast(COMMON_ERROR_TOAST_MESSAGE);
    } finally {
      setUploadingCount(0);
      isBusyRef.current = false;
    }
  }, [pickImage, remainingCount]);

  const removePhoto = useCallback((tempKey: string) => {
    setPhotos((current) => {
      const target = current.find((photo) => photo.tempKey === tempKey);
      if (target) revokePreview(target);
      return current.filter((photo) => photo.tempKey !== tempKey);
    });
  }, []);

  return {
    photos,
    uploadingCount,
    isUploading: uploadingCount > 0,
    canAddPhoto: remainingCount > 0 && uploadingCount === 0,
    addPhotos,
    removePhoto,
  };
}

export { useInquiryPhotos };
