'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ActionButton, Divider, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { useParams } from 'next/navigation';

import { WriteReviewComplete } from '@views/write-review-page/ui/WriteReviewComplete';

import { Header } from '@widgets/Header';
import { useKindergartenMainQuery } from '@features/kindergarten-main';
import { ReviewActionDialog, saveKnockdogReviewEdit, useKnockdogReviews } from '@features/review';
import { useBasePoint } from '@entities/user';
import { useNativeBackHandler, useStackNavigation } from '@shared/lib/bridge';
import { useImagePicker } from '@shared/lib/media';
import { openUnsavedExitDialog } from '@shared/lib/openUnsavedExitDialog';
import { resolvePublicImageSrc } from '@shared/lib/utils';
import { Skeleton } from '@shared/ui/skeleton';
import { toast } from '@shared/ui/toast';

const FALLBACK_COORD = { lng: 126.883439, lat: 37.511281 };
const MAX_REVIEW_LENGTH = 2000;
const MAX_PHOTO_COUNT = 10;
const SCROLLBAR_THUMB_WIDTH = 50;

const REVIEW_PLACEHOLDER =
  '유치원 이용에 대한 경험과 팁을 작성해 주세요. 적절하지 않은 내용은 삭제될 수 있어요.';
const REVIEW_NOTICES = [
  '유치원 경험과 관련된 내용만 작성해 주세요.',
  '개인정보, 허위사실, 비방∙욕설, 광고성 내용, 무단 복사한 사진이나 글이 포함되면 숨김 또는 삭제될 수 있어요.',
] as const;
const INVALID_PHOTO_MESSAGE = '20MB 이하의 JPG, JPEG, PNG, HEIC, HEIF 사진만 올릴 수 있어요.';

interface ReviewPhoto {
  id: string;
  url: string;
}

type EditDialog = 'confirm' | 'failure' | null;

function formatScore(rating: number) {
  return rating > 0 ? rating.toFixed(1) : '0';
}

function toPhotos(images: string[]) {
  return images.map((url, index) => ({ id: `${url}-${index}`, url }));
}

function isSameImages(original: string[], photos: ReviewPhoto[]) {
  return original.length === photos.length && original.every((url, index) => photos[index]?.url === url);
}

function ReviewStars({ rating, onChange }: { rating: number; onChange: (rating: number) => void }) {
  return (
    <div className='mt-4 flex w-60 items-center justify-between' role='group' aria-label='만족도'>
      {Array.from({ length: 5 }, (_, index) => {
        const value = index + 1;
        const isFilled = value <= rating;

        return (
          <button
            key={value}
            type='button'
            aria-label={`${value}점`}
            aria-pressed={isFilled}
            className='flex size-10 items-center justify-center'
            onClick={() => onChange(value)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- 별 SVG 원본 크기 유지 */}
            <img src={isFilled ? '/images/img_review_star_fill.svg' : '/images/img_review_star.svg'} alt='' />
          </button>
        );
      })}
    </div>
  );
}

function PhotoStrip({
  photos,
  canAdd,
  onAdd,
  onRemove,
}: {
  photos: ReviewPhoto[];
  canAdd: boolean;
  onAdd: () => void;
  onRemove?: (photoId: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ visible: false, left: 0 });

  const updateThumb = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const maxScroll = element.scrollWidth - element.clientWidth;
    const visible = maxScroll > 1;
    const maxLeft = Math.max(element.clientWidth - SCROLLBAR_THUMB_WIDTH, 0);
    const left = visible ? (element.scrollLeft / maxScroll) * maxLeft : 0;
    setThumb({ visible, left });
  }, []);

  useEffect(() => {
    updateThumb();
    const element = scrollRef.current;
    if (!element) return;

    const observer = new ResizeObserver(updateThumb);
    observer.observe(element);
    return () => observer.disconnect();
  }, [photos.length, canAdd, updateThumb]);

  return (
    <div>
      <div ref={scrollRef} className='scrollbar-hide flex gap-2 overflow-x-auto' onScroll={updateThumb}>
        {photos.map((photo) => (
          <div key={photo.id} className='relative size-[72px] shrink-0'>
            {/* eslint-disable-next-line @next/next/no-img-element -- 선택한 사진 미리보기 */}
            <img src={photo.url} alt='' className='radius-r2 size-full object-cover' />
            {onRemove ? (
              <button
                type='button'
                aria-label='사진 삭제'
                className='absolute top-1 right-1 z-20 inline-flex size-5 items-center justify-center'
                onClick={() => onRemove(photo.id)}
              >
                <Icon icon='DeleteInput' className='text-fill-secondary-700 !size-5' />
              </button>
            ) : null}
          </div>
        ))}
        {canAdd ? (
          <button
            type='button'
            aria-label='사진 추가'
            className='bg-bg-50 radius-r2 flex size-[72px] shrink-0 items-center justify-center'
            onClick={onAdd}
          >
            <Icon icon='Plus' className='text-fill-secondary-500 size-5' />
          </button>
        ) : null}
      </div>
      {thumb.visible ? (
        <div className='bg-bg-50 relative mt-2 h-1 w-full rounded-full'>
          <div
            className='bg-fill-secondary-700 absolute top-0 h-1 w-[50px] rounded-full'
            style={{ transform: `translateX(${thumb.left}px)` }}
          />
        </div>
      ) : null}
    </div>
  );
}

function KindergartenSummary({ id }: { id: string }) {
  const { coord } = useBasePoint();
  const { data, isLoading } = useKindergartenMainQuery({
    id,
    lng: coord?.lng ?? FALLBACK_COORD.lng,
    lat: coord?.lat ?? FALLBACK_COORD.lat,
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className='flex items-center gap-2 px-4 py-5'>
        <Skeleton className='radius-r2 size-11 shrink-0' />
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <Skeleton className='h-6 w-32' />
          <Skeleton className='h-5 w-52' />
        </div>
      </div>
    );
  }

  const imageSrc = resolvePublicImageSrc(data?.banner?.[0]);

  return (
    <div className='flex items-center gap-2 px-4 py-5'>
      {imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element -- 썸네일은 절대 URL 또는 S3 키
        <img src={imageSrc} alt='' className='radius-r2 size-11 shrink-0 object-cover' />
      ) : (
        <div className='bg-bg-50 radius-r2 size-11 shrink-0' />
      )}
      <div className='min-w-0 flex-1'>
        <p className='body1-bold text-text-primary truncate'>{data?.title}</p>
        <p className='body2-regular text-text-secondary truncate'>{data?.roadAddress}</p>
      </div>
    </div>
  );
}

export function WriteReviewPage() {
  const params = useParams<{ id: string; reviewId?: string }>();
  const id = params?.id;

  if (!id) throw new Error('Company ID is required for write review page');

  const reviewId = params.reviewId;
  const reviews = useKnockdogReviews();
  const editingReview = reviewId ? reviews.find((review) => review.id === reviewId) : undefined;

  const { back } = useStackNavigation();
  const { pickImage } = useImagePicker();
  const [isComplete, setIsComplete] = useState(false);
  const [rating, setRating] = useState(editingReview?.score ?? 0);
  const [content, setContent] = useState(editingReview?.content ?? '');
  const [photos, setPhotos] = useState<ReviewPhoto[]>(() => toPhotos(editingReview?.images ?? []));
  const [dialog, setDialog] = useState<EditDialog>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isPickingPhotoRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const didSaveRef = useRef(false);
  const photosRef = useRef<ReviewPhoto[]>([]);
  photosRef.current = photos;

  const isEdit = Boolean(editingReview);
  const isDirty = editingReview
    ? rating !== editingReview.score || content !== editingReview.content || !isSameImages(editingReview.images, photos)
    : rating > 0 || content.length > 0 || photos.length > 0;
  const canSubmit = editingReview
    ? isDirty && rating > 0 && content.trim().length > 0 && !isSubmitting
    : rating > 0 && content.trim().length > 0;

  useEffect(() => {
    if (!reviewId || editingReview) return;
    back();
  }, [back, editingReview, reviewId]);

  useEffect(() => {
    return () => {
      if (didSaveRef.current) return;
      photosRef.current.forEach((photo) => {
        if (photo.url.startsWith('blob:')) URL.revokeObjectURL(photo.url);
      });
    };
  }, []);

  const handleBack = useCallback(() => {
    if (isSubmittingRef.current) return;
    if (dialog) {
      setDialog(null);
      return;
    }
    if (isComplete || !isDirty) {
      back();
      return;
    }

    openUnsavedExitDialog({
      title: isEdit ? '수정하지 않고 나갈까요?' : '저장하지 않고 나갈까요?',
      description: isEdit ? '변경된 내용은 저장되지 않아요.' : '변경한 내용은 저장되지 않아요.',
      cancelLabel: '닫기',
      confirmLabel: '나가기',
      onConfirm: () => back(),
    });
  }, [back, dialog, isComplete, isDirty, isEdit]);

  useNativeBackHandler(handleBack);

  const handlePickPhoto = async () => {
    if (isPickingPhotoRef.current || isSubmittingRef.current) return;

    const remaining = MAX_PHOTO_COUNT - photos.length;
    if (remaining <= 0) return;

    isPickingPhotoRef.current = true;

    try {
      const result = await pickImage({
        source: 'library',
        mediaTypes: 'images',
        allowsMultipleSelection: true,
        orderedSelection: true,
        selectionLimit: remaining,
        skipUpload: true,
      });

      if (result.cancelled) return;

      const nextPhotos = result.assets.flatMap((asset) => {
        const url = asset.preSignedUrl || asset.uri;
        if (!url) return [];
        return [{ id: url, url }];
      });
      if (nextPhotos.length === 0) {
        toast({ nativeTitle: INVALID_PHOTO_MESSAGE, title: INVALID_PHOTO_MESSAGE });
        return;
      }

      setPhotos((current) => [...current, ...nextPhotos].slice(0, MAX_PHOTO_COUNT));

      const excludedCount =
        (result.skipped?.invalidSpecCount ?? 0) +
        (result.skipped?.oversizedCount ?? 0) +
        (result.skipped?.unreadableCount ?? 0);
      if (excludedCount > 0) {
        toast({ nativeTitle: INVALID_PHOTO_MESSAGE, title: INVALID_PHOTO_MESSAGE });
      }
    } catch (error) {
      if (error === 'NO_PERMISSION_LIBRARY' || error === 'NO_PERMISSION_CAMERA') return;
      toast({ nativeTitle: INVALID_PHOTO_MESSAGE, title: INVALID_PHOTO_MESSAGE });
    } finally {
      isPickingPhotoRef.current = false;
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    if (isSubmittingRef.current) return;

    setPhotos((current) => {
      const target = current.find((photo) => photo.id === photoId);
      if (target?.url.startsWith('blob:')) URL.revokeObjectURL(target.url);
      return current.filter((photo) => photo.id !== photoId);
    });
  };

  const handleSave = async () => {
    if (!editingReview || isSubmittingRef.current || !canSubmit) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      await saveKnockdogReviewEdit(editingReview.id, {
        score: rating,
        content,
        images: photos.map((photo) => photo.url),
      });
      didSaveRef.current = true;
      setDialog(null);
      back();
    } catch {
      setDialog('failure');
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (isComplete) return <WriteReviewComplete id={id} onConfirm={back} />;

  return (
    <div className='bg-bg-0 flex h-full flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>유치원 후기 작성</Header.Title>
      </Header>

      <div className='min-h-0 flex-1 overflow-y-auto'>
        <KindergartenSummary id={id} />
        <Divider size='thick' />

        <div className='flex flex-col items-center pt-6'>
          <p className='h3-semibold text-text-primary'>유치원은 만족하셨나요?</p>
          <ReviewStars rating={rating} onChange={setRating} />
          <p className={cn('body1-bold mt-2', rating > 0 ? 'text-text-accent' : 'text-fill-secondary-500')}>
            ({formatScore(rating)})
          </p>
        </div>

        <div className='mt-5 flex flex-col gap-2 px-4 py-3'>
          <p className='body2-bold text-text-primary'>리뷰 작성</p>
          <label className='bg-bg-50 radius-r2 flex flex-col gap-8 px-4 py-3'>
            <textarea
              value={content}
              maxLength={MAX_REVIEW_LENGTH}
              placeholder={REVIEW_PLACEHOLDER}
              className='body1-regular text-text-primary placeholder:text-fill-secondary-500 min-h-12 w-full resize-none bg-transparent outline-none'
              onChange={(event) => setContent(event.target.value)}
            />
            <p className='body2-regular text-text-caption'>
              {content.length.toLocaleString('ko-KR')}/{MAX_REVIEW_LENGTH.toLocaleString('ko-KR')}
            </p>
          </label>
        </div>

        <div className='flex flex-col gap-2 px-4'>
          <p className='body2-bold text-text-primary'>사진 등록</p>
          <PhotoStrip
            photos={photos}
            canAdd={photos.length < MAX_PHOTO_COUNT}
            onAdd={handlePickPhoto}
            onRemove={isEdit ? handleRemovePhoto : undefined}
          />
        </div>

        <div className='mt-5 px-4 pb-4'>
          <div className='bg-bg-50 radius-r4 p-4'>
            <ul className='body2-regular text-fill-secondary-500 list-disc pl-[21px] [&>li:not(:last-child)]:mb-2.5'>
              {REVIEW_NOTICES.map((notice) => (
                <li key={notice}>{notice}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className='bg-bg-0 shrink-0 p-4'>
        <ActionButton
          type='button'
          size='large'
          disabled={!canSubmit}
          onClick={() => {
            if (isEdit) {
              setDialog('confirm');
              return;
            }
            setIsComplete(true);
          }}
        >
          {isEdit ? '수정하기' : '등록하기'}
        </ActionButton>
      </div>

      {isEdit ? (
        <>
          <ReviewActionDialog
            isOpen={dialog === 'confirm'}
            isSubmitting={isSubmitting}
            title='리뷰를 수정할까요?'
            description='수정한 리뷰를 저장합니다.'
            hideDescription
            cancelLabel='아니요'
            confirmLabel='네'
            onClose={() => setDialog(null)}
            onConfirm={() => {
              handleSave();
            }}
          />
          <ReviewActionDialog
            isOpen={dialog === 'failure'}
            isSubmitting={isSubmitting}
            title='리뷰를 수정하지 못했어요'
            description='잠시 후 다시 시도해 주세요.'
            cancelLabel='닫기'
            confirmLabel='다시 시도'
            onClose={() => setDialog(null)}
            onConfirm={() => {
              handleSave();
            }}
          />
        </>
      ) : null}
    </div>
  );
}
