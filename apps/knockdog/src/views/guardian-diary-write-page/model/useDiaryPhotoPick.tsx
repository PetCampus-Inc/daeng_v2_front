'use client';

import { useCallback } from 'react';
import { overlay } from 'overlay-kit';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@knockdog/ui';

import { openSystemSetting } from '@shared/lib/bridge/openSystemSetting';
import { useImagePicker, type WebImageAsset } from '@shared/lib/media';
import { toast } from '@shared/ui/toast';

import { DIARY_PHOTO_LIMIT, type DiaryWritePhoto } from '../lib/diaryWriteForm';
import { DIARY_PHOTO_MAX_BYTES, uploadDiaryPhotoFiles, type DiaryPickAsset } from '../lib/uploadDiaryPhotoFile';

const DIARY_PHOTO_FAIL = '사진을 올리지 못했어요. 잠시 후 다시 시도해주세요';

function showPhotoFailToast() {
  toast({ title: DIARY_PHOTO_FAIL, nativeTitle: DIARY_PHOTO_FAIL, position: 'bottom-above-nav', shape: 'rounded' });
}

function useDiaryPhotoPick(
  photos: DiaryWritePhoto[],
  onChange: (update: DiaryWritePhoto[] | ((current: DiaryWritePhoto[]) => DiaryWritePhoto[])) => void
) {
  const { pickImage } = useImagePicker();

  const pickPhotos = useCallback(
    async (source: 'library' | 'camera') => {
      const remaining = DIARY_PHOTO_LIMIT - photos.length;
      if (remaining <= 0) return;

      try {
        const result = await pickImage({
          source,
          allowsMultipleSelection: true,
          selectionLimit: remaining,
          quality: 0.8,
          skipUpload: true,
          resizeThresholdBytes: DIARY_PHOTO_MAX_BYTES,
        });
        if (result.cancelled || !result.assets) return;

        const picked = (result.assets as WebImageAsset[])
          .slice(0, remaining)
          .filter((asset) => asset.uri || asset.file);
        const skippedCount =
          (result.skipped?.invalidSpecCount ?? 0) +
          (result.skipped?.oversizedCount ?? 0) +
          (result.skipped?.unreadableCount ?? 0);
        if (picked.length === 0) {
          showPhotoFailToast();
          return;
        }

        const uploaded = await uploadDiaryPhotoFiles(picked as DiaryPickAsset[]);
        if (uploaded.photos.length > 0) {
          onChange((current) =>
            [
              ...current,
              ...uploaded.photos.map((photo) => ({ id: photo.tempKey, src: photo.src, tempKey: photo.tempKey })),
            ].slice(0, DIARY_PHOTO_LIMIT)
          );
        }
        if (uploaded.rejectedCount > 0 || uploaded.failedCount > 0 || skippedCount > 0) showPhotoFailToast();
      } catch (error: unknown) {
        if (error === 'NO_PERMISSION_LIBRARY' || error === 'NO_PERMISSION_CAMERA') {
          overlay.open(({ isOpen, close }) => (
            <AlertDialog open={isOpen} onOpenChange={close}>
              <AlertDialogContent overlayClassName='z-102' className='z-103'>
                <AlertDialogHeader>
                  <AlertDialogTitle>사진 접근 권한이 필요해요</AlertDialogTitle>
                  <AlertDialogDescription>
                    사용 중인 기기에서 사진 접근 권한을 <br />
                    &apos;허용&apos;으로 설정해 주세요.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>나중에 하기</AlertDialogCancel>
                  <AlertDialogAction onClick={openSystemSetting}>설정하기</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ));
          return;
        }
        showPhotoFailToast();
      }
    },
    [onChange, photos, pickImage]
  );

  return { pickPhotos };
}

export { useDiaryPhotoPick };
