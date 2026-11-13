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

function useDiaryPhotoPick(photos: DiaryWritePhoto[], onChange: (photos: DiaryWritePhoto[]) => void) {
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
        });
        if (result.cancelled || !result.assets) return;

        const nextPhotos = (result.assets as WebImageAsset[]).slice(0, remaining).flatMap((asset, index) => {
          if (!asset.uri) return [];
          return [{ id: `${asset.uri}-${photos.length + index}`, src: asset.uri }];
        });
        onChange([...photos, ...nextPhotos].slice(0, DIARY_PHOTO_LIMIT));
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
        toast({
          title: error instanceof Error ? error.message : String(error),
          position: 'bottom-above-nav',
        });
      }
    },
    [onChange, photos, pickImage]
  );

  return { pickPhotos };
}

export { useDiaryPhotoPick };
