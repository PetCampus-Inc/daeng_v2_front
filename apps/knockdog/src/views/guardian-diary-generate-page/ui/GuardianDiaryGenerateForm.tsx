'use client';

import Lottie from 'lottie-react';
import { InfoLine, Reset } from '@knockdog/icons';
import {
  ActionButton,
  DiaryEditText,
  DiaryImageCarousel,
  DiaryTopBar,
} from '@knockdog/ui';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';

import {
  DIARY_ERROR_TEXT,
  DIARY_LOADING_TEXT,
  getDiaryDialogCopy,
  getGenerateButtonLabel,
  type DiaryGenerateDialog,
  type DiaryGenerateStatus,
} from '../lib/diaryGenerate';
import loadingDots from '../config/loadingDots.json';

import { BottomCta } from '@shared/ui/bottom-cta';

interface GuardianDiaryGenerateFormProps {
  dogName: string;
  dateLabel: string;
  photos: string[];
  status: DiaryGenerateStatus;
  body: string;
  isEditing: boolean;
  isSaved: boolean;
  hasTriedLeave: boolean;
  dialog: DiaryGenerateDialog | null;
  onBack: () => void;
  onRetry: () => void;
  onEdit: () => void;
  onBodyChange: (body: string) => void;
  onSave: () => void;
  onConfirmSave: () => void;
  onKeepWriting: () => void;
  onLeave: () => void;
  hasMissingDraft?: boolean;
}

function DiaryLoadingDots() {
  return <Lottie animationData={loadingDots} loop autoplay aria-hidden style={{ width: 32, height: 40 }} />;
}

function GuardianDiaryGenerateForm({
  dogName,
  dateLabel,
  photos,
  status,
  body,
  isEditing,
  isSaved,
  hasTriedLeave,
  dialog,
  onBack,
  onRetry,
  onEdit,
  onBodyChange,
  onSave,
  onConfirmSave,
  onKeepWriting,
  onLeave,
  hasMissingDraft = false,
}: GuardianDiaryGenerateFormProps) {
  const dialogCopy = dialog ? getDiaryDialogCopy(dialog) : null;

  return (
    <div className='bg-bg-0 flex h-full min-h-0 flex-1 flex-col overflow-hidden'>
      <DiaryTopBar mode='plain' title='일기 쓰기' onBack={onBack} />
      <div className='px-x4 pt-x6 gap-x4 flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto'>
        <p className='label-medium text-text-primary'>{dateLabel}</p>
        <DiaryImageCarousel
          images={photos.map((photo, index) => (
            <img key={`${index}-${photo}`} src={photo} alt='' className='size-full object-cover' />
          ))}
        />
        {status === 'generating' ? (
          <div className='bg-bg-50 radius-r2 p-x4 flex h-[150px] w-full items-start gap-[10px]'>
            <DiaryLoadingDots />
            <p className='body1-regular text-text-caption flex-1'>{DIARY_LOADING_TEXT}</p>
          </div>
        ) : null}
        {status === 'error' ? (
          <div className='bg-bg-50 radius-r2 p-x4 flex w-full items-start gap-[6px]'>
            <InfoLine className='text-line-accent mt-[5px] size-[14px] shrink-0' />
            <p className='body1-regular text-fill-secondary-500 flex-1 whitespace-pre-line'>
              {hasMissingDraft ? '작성 정보를 불러오지 못했어요. 이전 화면으로 돌아가 다시 만들어 주세요.' : DIARY_ERROR_TEXT}
            </p>
          </div>
        ) : null}
        {status === 'done' && isSaved ? <p className='body1-regular text-text-primary whitespace-pre-line px-x2 py-x4'>{body}</p> : null}
        {status === 'done' && !isSaved ? (
          <DiaryEditText body={body} isEditing={isEditing} onEdit={onEdit} onBodyChange={isEditing ? onBodyChange : undefined} />
        ) : null}
      </div>
      {isSaved ? null : (
        <BottomCta className='bg-bg-0 p-x4 shrink-0'>
          {status === 'error' ? (
            <ActionButton type='button' variant='primaryFill' size='large' className='gap-x1_5' onClick={onRetry}>
              <Reset className='size-x5' />
              {hasMissingDraft ? '이전 화면으로 돌아가기' : '다시 시도하기'}
            </ActionButton>
          ) : null}
          {status === 'done' ? (
            <ActionButton type='button' variant='primaryFill' size='large' onClick={onSave}>
              저장하기
            </ActionButton>
          ) : null}
          {status === 'generating' ? (
            <ActionButton type='button' variant='primaryFill' size='large' disabled>
              {getGenerateButtonLabel(dogName, hasTriedLeave)}
            </ActionButton>
          ) : null}
        </BottomCta>
      )}
      <ConfirmDialog
        isOpen={dialog !== null}
        title={dialogCopy?.title ?? ''}
        description={dialogCopy?.lines.join('\n')}
        cancelLabel='계속 작성하기'
        confirmLabel={dialogCopy?.confirmLabel ?? ''}
        onClose={onKeepWriting}
        onConfirm={() => {
          if (dialog === 'save') onConfirmSave();
          else onLeave();
          onKeepWriting();
        }}
      />
    </div>
  );
}

export { GuardianDiaryGenerateForm };
export type { GuardianDiaryGenerateFormProps };
