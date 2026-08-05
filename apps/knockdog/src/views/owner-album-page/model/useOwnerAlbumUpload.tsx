'use client';

import { useCallback, useRef, useState } from 'react';

import { useOwnerRole } from '@features/role-conversion';

import { ownerAlbumContent } from '@views/owner-album-page/config/ownerAlbumContent';
import { uploadOwnerAlbumPhotos } from '@views/owner-album-page/lib/uploadOwnerAlbumPhotos';
import type { OwnerAlbumPhoto } from '@views/owner-album-page/model/ownerAlbumPhoto';
import { openOwnerAlbumAlert } from '@views/owner-album-page/ui/OwnerAlbumAlertDialog';

import { useImagePicker, type WebImageAsset } from '@shared/lib/media';
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
  const { schoolId } = useOwnerRole();
  const { pickImage } = useImagePicker();
  const [photos, setPhotos] = useState<OwnerAlbumPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const isUploadInFlightRef = useRef(false);

  const handleUploadClick = useCallback(async () => {
    if (isUploadInFlightRef.current || isUploading) return;

    if (schoolId == null) {
      openOwnerAlbumAlert(
        ownerAlbumContent.upload.networkFailedTitle,
        ownerAlbumContent.upload.networkFailedDescription
      );
      return;
    }

    isUploadInFlightRef.current = true;

    try {
      const result = await pickImage({
        source: 'library',
        mediaTypes: 'images',
        allowsMultipleSelection: true,
        orderedSelection: true,
        selectionLimit: ownerAlbumContent.maxSelectionCount,
        skipUpload: true,
      });

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

      setIsUploading(true);

      const uploadResult = await uploadOwnerAlbumPhotos({
        schoolId,
        assets: result.assets as WebImageAsset[],
      });

      if (uploadResult.uploaded.length > 0) {
        setPhotos((prev) => [...uploadResult.uploaded, ...prev]);
      }

      const pickSkippedCount =
        (result.skipped?.invalidSpecCount ?? 0) + (result.skipped?.unreadableCount ?? 0);
      const commitExcludedCount = uploadResult.excludedCount + uploadResult.s3FailedCount;
      const totalExcluded = pickSkippedCount + commitExcludedCount;

      if (uploadResult.uploaded.length === 0) {
        openOwnerAlbumAlert(
          ownerAlbumContent.upload.noneValidTitle,
          ownerAlbumContent.upload.noneValidDescription
        );
        return;
      }

      if (totalExcluded > 0) {
        const description =
          (result.skipped?.invalidSpecCount ?? 0) > 0
            ? ownerAlbumContent.upload.partialInvalidSpecDescription
            : commitExcludedCount > 0 && uploadResult.excludeReason
              ? uploadResult.excludeReason
              : ownerAlbumContent.upload.partialUnreadableDescription;

        openOwnerAlbumAlert(
          ownerAlbumContent.upload.partialExcludedTitle(totalExcluded),
          description
        );
        return;
      }

      showUploadSuccessToast();
    } catch (error) {
      if (error === 'NO_PERMISSION_LIBRARY' || error === 'NO_PERMISSION_CAMERA') return;

      console.error('[owner-album] upload failed', error);
      if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
        console.error('[owner-album] api error detail', {
          code: (error as { code: unknown }).code,
          message: (error as { message: unknown }).message,
          status: (error as { status?: unknown }).status,
        });
      }

      openOwnerAlbumAlert(
        ownerAlbumContent.upload.networkFailedTitle,
        ownerAlbumContent.upload.networkFailedDescription
      );
    } finally {
      isUploadInFlightRef.current = false;
      setIsUploading(false);
    }
  }, [isUploading, pickImage, schoolId]);

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
