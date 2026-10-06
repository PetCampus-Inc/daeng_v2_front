'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
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
  Icon,
} from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import { editMemoContent } from '@views/edit-memo-page/config/editMemoContent';
import { openMemoImageAlert } from '@views/edit-memo-page/ui/MemoImageAlertDialog';

import { toMemoPhotoUrl, useMemoMutation, useMemoQuery, useResolveMemoPhotoKeys } from '@features/memo';

import { Header } from '@widgets/Header';

import { createAnalyticsId, trackSchoolMemoChangeResult, trackSchoolMemoView } from '@shared/lib/analytics';
import { useNativeBackHandler, useStackNavigation } from '@shared/lib/bridge';
import { useImagePicker } from '@shared/lib/media';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { MiniPhotoBox } from '@shared/ui/photo-uploader';
import { Skeleton } from '@shared/ui/skeleton';
import { toast } from '@shared/ui/toast';

const { maxLength: MAX_LENGTH, maxPhotoCount: MAX_PHOTO_COUNT } = editMemoContent;

interface MemoPhoto {
  key: string;
  url: string;
}

function showSaveSuccessToast() {
  toast({
    type: 'success',
    nativeTitle: editMemoContent.saveSuccessToast,
    titleParts: [{ text: '메모', accent: true }, { text: '를 저장했어요' }],
    title: (
      <>
        <span className='text-text-accent'>메모</span>
        <span className='text-text-primary-inverse'>를 저장했어요</span>
      </>
    ),
  });
}

function showMaxPhotoCountToast() {
  toast({
    nativeTitle: editMemoContent.maxPhotoCountToast,
    titleParts: [
      { text: '사진은 최대 ' },
      { text: `${MAX_PHOTO_COUNT}장`, accent: true },
      { text: '까지 올릴 수 있어요' },
    ],
    title: (
      <>
        <span className='text-text-primary-inverse'>사진은 최대 </span>
        <span className='text-text-accent'>{MAX_PHOTO_COUNT}장</span>
        <span className='text-text-primary-inverse'>까지 올릴 수 있어요</span>
      </>
    ),
    duration: 3000,
  });
}

function isSamePhotos(current: MemoPhoto[], initial: MemoPhoto[]) {
  return current.length === initial.length && current.every((photo, index) => photo.key === initial[index]?.key);
}

export function EditMemoPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  if (!id) throw new Error('Company ID is required for edit memo page');

  const { back } = useStackNavigation();
  const { pickImage } = useImagePicker();
  const resolvePhotoKeys = useResolveMemoPhotoKeys(id);
  const { data: memoData, isLoading } = useMemoQuery(id);
  const { mutateAsync: updateMemoAsync } = useMemoMutation();

  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<MemoPhoto[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isPickingPhoto, setIsPickingPhoto] = useState(false);
  const isPickingPhotoRef = useRef(false);
  const initialRef = useRef<{ content: string; photos: MemoPhoto[] }>({ content: '', photos: [] });
  const isHydratedRef = useRef(false);
  const isExitDialogOpenRef = useRef(false);

  useEffect(() => {
    if (!memoData || isHydratedRef.current) return;
    isHydratedRef.current = true;

    const initialContent = memoData.content ?? '';
    const initialPhotos = (memoData.photos ?? []).map((photo) => ({ key: photo.key, url: toMemoPhotoUrl(photo.key) }));
    initialRef.current = { content: initialContent, photos: initialPhotos };
    setContent(initialContent);
    setPhotos(initialPhotos);

    trackSchoolMemoView({
      listing_id: id,
      has_text: initialContent.trim() ? 1 : 0,
      photo_count: initialPhotos.length,
      entry_point: 'school_detail',
    });
  }, [id, memoData]);

  const isUploading = uploadingCount > 0;
  const isDirty = content !== initialRef.current.content || !isSamePhotos(photos, initialRef.current.photos);
  const canSave = isDirty && !isPickingPhoto && !isUploading && !isSaving;

  const handleBack = useCallback(() => {
    if (isSaving) return;
    if (!isDirty) {
      back();
      return;
    }
    if (isExitDialogOpenRef.current) return;
    isExitDialogOpenRef.current = true;

    overlay.open(({ isOpen, close }) => (
      <AlertDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (open) return;
          isExitDialogOpenRef.current = false;
          close();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{editMemoContent.unsavedExit.title}</AlertDialogTitle>
            <AlertDialogDescription>{editMemoContent.unsavedExit.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{editMemoContent.unsavedExit.cancelLabel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => back()}>{editMemoContent.unsavedExit.confirmLabel}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  }, [back, isDirty, isSaving]);

  useNativeBackHandler(handleBack);

  const handlePickPhoto = async () => {
    if (isPickingPhotoRef.current || isUploading) return;

    const remaining = MAX_PHOTO_COUNT - photos.length;
    if (remaining <= 0) {
      showMaxPhotoCountToast();
      return;
    }

    const { imageUpload } = editMemoContent;
    isPickingPhotoRef.current = true;
    setIsPickingPhoto(true);

    try {
      const result = await pickImage(
        {
          source: 'library',
          mediaTypes: 'images',
          allowsMultipleSelection: true,
          orderedSelection: true,
          selectionLimit: remaining,
        },
        { onUploading: setUploadingCount }
      );

      if (result.cancelled) return;
      if (result.exceededLimit) showMaxPhotoCountToast();

      if (result.assets.length === 0) {
        if (result.failure === 'network') {
          openMemoImageAlert(imageUpload.networkFailedTitle, imageUpload.networkFailedDescription);
          return;
        }
        openMemoImageAlert(imageUpload.noneValidTitle, imageUpload.noneValidDescription);
        return;
      }

      const nextPhotos = result.assets.map((asset) => ({ key: asset.key, url: asset.preSignedUrl }));
      setPhotos((current) => [...current, ...nextPhotos].slice(0, MAX_PHOTO_COUNT));

      const invalidSpecCount = result.skipped?.invalidSpecCount ?? 0;
      const oversizedCount = result.skipped?.oversizedCount ?? 0;
      const excludedCount = invalidSpecCount + oversizedCount + (result.skipped?.unreadableCount ?? 0);

      if (excludedCount > 0) {
        openMemoImageAlert(
          imageUpload.partialExcludedTitle(excludedCount),
          invalidSpecCount > 0 || oversizedCount > 0
            ? imageUpload.partialInvalidSpecDescription
            : imageUpload.partialUnreadableDescription
        );
      }
    } catch (error) {
      if (error === 'NO_PERMISSION_LIBRARY' || error === 'NO_PERMISSION_CAMERA') return;
      openMemoImageAlert(imageUpload.networkFailedTitle, imageUpload.networkFailedDescription);
    } finally {
      setUploadingCount(0);
      isPickingPhotoRef.current = false;
      setIsPickingPhoto(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index));
  };

  const handleSave = async () => {
    if (!canSave) return;

    const operationId = createAnalyticsId();
    setIsSaving(true);

    try {
      const photoKeys = await resolvePhotoKeys(
        photos.map((photo) => photo.key),
        initialRef.current.photos.map((photo) => photo.key)
      );
      await updateMemoAsync({ targetId: id, content, photoKeys });

      trackSchoolMemoChangeResult({
        listing_id: id,
        operation_id: operationId,
        action: 'text_save',
        has_text: content.trim() ? 1 : 0,
        photo_count: photoKeys.length,
        result: 'success',
      });
      initialRef.current = { content, photos };
      showSaveSuccessToast();
      back();
    } catch {
      trackSchoolMemoChangeResult({
        listing_id: id,
        operation_id: operationId,
        action: 'text_save',
        result: 'failed',
      });
      openSaveFailedDialog();
    } finally {
      setIsSaving(false);
    }
  };

  function openSaveFailedDialog() {
    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={(open) => !open && close()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{editMemoContent.saveFailed.title}</AlertDialogTitle>
            <AlertDialogDescription>{editMemoContent.saveFailed.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{editMemoContent.saveFailed.cancelLabel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                close();
                handleSave();
              }}
            >
              {editMemoContent.saveFailed.retryLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  }

  if (isLoading) {
    return (
      <div className='bg-bg-0 flex h-full flex-col'>
        <Header>
          <Header.LeftSection>
            <Header.BackButton onClick={back} />
          </Header.LeftSection>
          <Header.Title>{editMemoContent.pageTitle}</Header.Title>
        </Header>
        <DelayedLoadingSpinner isLoading layout='content' />
      </div>
    );
  }

  const hasPhotoStrip = photos.length > 0 || isUploading;
  const skeletonCount = Math.min(uploadingCount, MAX_PHOTO_COUNT - photos.length);

  return (
    <div className='bg-bg-0 flex h-full flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>{editMemoContent.pageTitle}</Header.Title>
        <Header.RightSection>
          <button
            type='button'
            disabled={!canSave}
            className={cn(
              'label-semibold radius-r1 px-2 py-1 disabled:opacity-100',
              canSave ? 'bg-fill-primary-50 text-text-accent' : 'bg-fill-secondary-100 text-text-caption'
            )}
            onClick={handleSave}
          >
            {editMemoContent.saveLabel}
          </button>
        </Header.RightSection>
      </Header>

      <main className='flex min-h-0 flex-1 flex-col'>
        <div className='flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 py-5'>
          <textarea
            value={content}
            maxLength={MAX_LENGTH}
            placeholder={editMemoContent.placeholder}
            className='body1-regular text-text-primary caret-text-accent placeholder:text-text-caption min-h-40 w-full flex-1 resize-none bg-transparent outline-none'
            onChange={(event) => setContent(event.target.value)}
          />
          <p className='body2-regular text-text-caption shrink-0'>
            {content.length.toLocaleString()}/{MAX_LENGTH.toLocaleString()}
          </p>
        </div>

        {hasPhotoStrip && (
          <div className='scrollbar-hide flex shrink-0 gap-3 overflow-x-auto bg-white px-4 py-2' aria-busy={isUploading}>
            {photos.map((photo, index) => (
              <MiniPhotoBox
                key={`${photo.key}-${index}`}
                imageUrl={photo.url}
                className='size-[60px]'
                onRemove={isUploading ? undefined : () => handleRemovePhoto(index)}
              />
            ))}
            {Array.from({ length: skeletonCount }, (_, index) => (
              <Skeleton
                key={`memo-photo-skeleton-${index}`}
                className='size-[60px] shrink-0 rounded-lg'
                aria-label='사진 업로드 중'
              />
            ))}
          </div>
        )}

        <div className='border-line-200 shrink-0 border-t bg-white px-4 py-3 pb-[max(0.75rem,var(--safe-area-inset-bottom,0px))]'>
          <button
            type='button'
            className='flex items-center gap-2 disabled:opacity-40'
            disabled={isUploading}
            onClick={handlePickPhoto}
          >
            <Icon icon='Gallery' className='text-fill-secondary-700 size-7' />
            <span className='body1-medium text-text-secondary'>{editMemoContent.photoLabel}</span>
          </button>
        </div>
      </main>
    </div>
  );
}
