'use client';

import { useCallback, useRef, useState } from 'react';

import { ownerAlbumContent } from '@views/owner-album-page/config/ownerAlbumContent';
import type { OwnerAlbumPhoto } from '@views/owner-album-page/model/ownerAlbumPhoto';

import { useImagePicker } from '@shared/lib/media';
import { toast } from '@shared/ui/toast';

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

      if (result.cancelled || !result.assets?.length) return;

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
    } catch {
      toast({
        nativeTitle: ownerAlbumContent.uploadFailedToast.nativeTitle,
        title: (
          <>
            <span className='text-text-accent'>사진</span>
            <span className='text-text-primary-inverse'>을 올리지 못했어요</span>
          </>
        ),
      });
    } finally {
      isUploadInFlightRef.current = false;
      setIsUploading(false);
    }
  }, [isUploading, pickImage]);

  return {
    photos,
    hasPhotos: photos.length > 0,
    isUploading,
    handleUploadClick,
  };
}

export { useOwnerAlbumUpload };
