'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import {
  ownerAlbumPhotosQueryKey,
  useOwnerAlbumPhotosInfiniteQuery,
} from '@entities/owner-album';
import { useUserStore } from '@entities/user';
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
  const queryClient = useQueryClient();
  const { schoolId } = useOwnerRole();
  const userId = useUserStore((state) => state.user?.userId);
  const { pickImage } = useImagePicker();
  const [isUploading, setIsUploading] = useState(false);
  const isUploadInFlightRef = useRef(false);

  const photosQuery = useOwnerAlbumPhotosInfiniteQuery({
    schoolId,
    userId,
    enabled: schoolId != null,
  });

  const photos = useMemo<OwnerAlbumPhoto[]>(() => {
    const pages = photosQuery.data?.pages ?? [];
    const flattened = pages.flatMap((page) => page.photos);
    const uniqueById = new Map<string, OwnerAlbumPhoto>();

    for (const photo of flattened) {
      if (!uniqueById.has(photo.id)) {
        uniqueById.set(photo.id, photo);
      }
    }

    return Array.from(uniqueById.values());
  }, [photosQuery.data?.pages]);

  const invalidatePhotos = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ownerAlbumPhotosQueryKey(schoolId, userId),
    });
  }, [queryClient, schoolId, userId]);

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
        await invalidatePhotos();
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
  }, [invalidatePhotos, isUploading, pickImage, schoolId]);

  const removePhoto = useCallback(
    (photoId: string) => {
      queryClient.setQueryData<{
        pages: Array<{ photos: OwnerAlbumPhoto[]; nextCursor: number | null }>;
        pageParams: Array<number | undefined>;
      }>(ownerAlbumPhotosQueryKey(schoolId, userId), (prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          pages: prev.pages.map((page) => ({
            ...page,
            photos: page.photos.filter((photo) => photo.id !== photoId),
          })),
        };
      });
    },
    [queryClient, schoolId, userId]
  );

  return {
    photos,
    hasPhotos: photos.length > 0,
    isUploading,
    isPhotosLoading: photosQuery.isLoading,
    hasNextPage: photosQuery.hasNextPage,
    isFetchingNextPage: photosQuery.isFetchingNextPage,
    fetchNextPage: photosQuery.fetchNextPage,
    handleUploadClick,
    removePhoto,
  };
}

export { useOwnerAlbumUpload };
