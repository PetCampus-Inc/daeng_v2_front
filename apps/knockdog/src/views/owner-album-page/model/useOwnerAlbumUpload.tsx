'use client';

import { useCallback, useRef, useState } from 'react';

import { ownerAlbumContent } from '@views/owner-album-page/config/ownerAlbumContent';
import type { OwnerAlbumPhoto } from '@views/owner-album-page/model/ownerAlbumPhoto';
import { openOwnerAlbumAlert } from '@views/owner-album-page/ui/OwnerAlbumAlertDialog';

import { useImagePicker } from '@shared/lib/media';
import { toast } from '@shared/ui/toast';

function showMaxCountToast() {
  toast({
    nativeTitle: ownerAlbumContent.upload.maxCountToast.nativeTitle,
    title: (
      <>
        <span className='text-text-primary-inverse'>사진은 한 번에 최대 </span>
        <span className='text-text-accent'>{ownerAlbumContent.maxSelectionCount}장</span>
        <span className='text-text-primary-inverse'>까지 올릴 수 있어요</span>
      </>
    ),
    duration: 3000,
  });
}

function showUploadSuccessToast() {
  toast({
    type: 'success',
    nativeTitle: ownerAlbumContent.uploadSuccessToast.nativeTitle,
    title: (
      <>
        <span className='text-text-accent'>사진</span>
        <span className='text-text-primary-inverse'>을 올렸어요</span>
      </>
    ),
    duration: 3000,
  });
}

function useOwnerAlbumUpload() {
  const { pickImage } = useImagePicker();
  const [photos, setPhotos] = useState<OwnerAlbumPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const isUploadInFlightRef = useRef(false);

  const handleUploadClick = useCallback(async () => {
    if (isUploadInFlightRef.current || isUploading) return;

    isUploadInFlightRef.current = true;

    try {
      const result = await pickImage(
        {
          source: 'library',
          mediaTypes: 'images',
          allowsMultipleSelection: true,
          orderedSelection: true,
          selectionLimit: ownerAlbumContent.maxSelectionCount,
        },
        {
          onUploading: () => {
            setIsUploading(true);
          },
        }
      );

      if (result.cancelled) return;

      if (result.exceededLimit) {
        showMaxCountToast();
      }

      if (result.assets.length === 0) {
        if (result.failure === 'network') {
          openOwnerAlbumAlert(
            ownerAlbumContent.upload.networkFailedTitle,
            ownerAlbumContent.upload.networkFailedDescription
          );
          return;
        }

        openOwnerAlbumAlert(
          ownerAlbumContent.upload.noneValidTitle,
          ownerAlbumContent.upload.noneValidDescription
        );
        return;
      }

      const uploadedAt = Date.now();
      // TODO: POST owner/album 배치 등록 API 연동 후 서버 목록으로 교체
      setPhotos((prev) => [
        ...result.assets.map((asset, index) => ({
          id: `${asset.key}-${uploadedAt}-${index}`,
          key: asset.key,
          url: asset.preSignedUrl,
          uploadedAt: uploadedAt - index,
        })),
        ...prev,
      ]);

      const skippedCount =
        (result.skipped?.invalidSpecCount ?? 0) + (result.skipped?.unreadableCount ?? 0);

      if (skippedCount > 0) {
        const description =
          (result.skipped?.invalidSpecCount ?? 0) > 0
            ? ownerAlbumContent.upload.partialInvalidSpecDescription
            : ownerAlbumContent.upload.partialUnreadableDescription;

        openOwnerAlbumAlert(
          ownerAlbumContent.upload.partialExcludedTitle(skippedCount),
          description
        );
        return;
      }

      showUploadSuccessToast();
    } catch (error) {
      if (error === 'NO_PERMISSION_LIBRARY' || error === 'NO_PERMISSION_CAMERA') return;

      openOwnerAlbumAlert(
        ownerAlbumContent.upload.networkFailedTitle,
        ownerAlbumContent.upload.networkFailedDescription
      );
    } finally {
      isUploadInFlightRef.current = false;
      setIsUploading(false);
    }
  }, [isUploading, pickImage]);

  const removePhoto = useCallback((photoId: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
  }, []);

  return {
    photos,
    hasPhotos: photos.length > 0,
    isUploading,
    handleUploadClick,
    removePhoto,
  };
}

export { useOwnerAlbumUpload };
