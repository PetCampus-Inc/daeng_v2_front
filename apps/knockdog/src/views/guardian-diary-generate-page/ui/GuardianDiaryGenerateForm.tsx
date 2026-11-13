'use client';

import { InfoLine, Reset } from '@knockdog/icons';
import {
  ActionButton,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  DiaryEditText,
  DiaryImageCarousel,
  DiaryTopBar,
} from '@knockdog/ui';

import {
  DIARY_ERROR_TEXT,
  DIARY_LOADING_TEXT,
  getDiaryDialogCopy,
  getGenerateButtonLabel,
  type DiaryGenerateDialog,
  type DiaryGenerateStatus,
} from '../lib/diaryGenerate';

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
}

function DiaryLoadingDots() {
  return (
    <span className='gap-0.5 flex h-5 w-7 items-center' aria-hidden>
      <span className='bg-text-caption size-1 animate-bounce rounded-full [animation-delay:0ms]' />
      <span className='bg-text-caption size-1 animate-bounce rounded-full [animation-delay:150ms]' />
      <span className='bg-text-caption size-1 animate-bounce rounded-full [animation-delay:300ms]' />
    </span>
  );
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
}: GuardianDiaryGenerateFormProps) {
  const dialogCopy = dialog ? getDiaryDialogCopy(dialog) : null;

  return (
    <div className='bg-bg-0 flex min-h-0 flex-1 flex-col'>
      <DiaryTopBar mode='plain' title='일기 쓰기' onBack={onBack} />
      <div className='px-x4 pt-x6 gap-x4 flex min-h-0 flex-1 flex-col overflow-y-auto'>
        <p className='label-medium text-text-primary'>{dateLabel}</p>
        <DiaryImageCarousel
          images={photos.map((photo) => (
            <img key={photo} src={photo} alt='' className='size-full object-cover' />
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
            <InfoLine className='text-fill-secondary-500 mt-[5px] size-[14px] shrink-0' />
            <p className='body1-regular text-fill-secondary-500 flex-1'>{DIARY_ERROR_TEXT}</p>
          </div>
        ) : null}
        {status === 'done' && isSaved ? <p className='body1-regular text-text-primary whitespace-pre-line px-x2 py-x4'>{body}</p> : null}
        {status === 'done' && !isSaved ? (
          <DiaryEditText body={body} isEditing={isEditing} onEdit={onEdit} onBodyChange={isEditing ? onBodyChange : undefined} />
        ) : null}
      </div>
      {isSaved ? null : (
        <div className='p-x4'>
          {status === 'error' ? (
            <ActionButton type='button' variant='primaryFill' size='large' className='gap-x1_5' onClick={onRetry}>
              <Reset className='size-x5' />
              다시 시도하기
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
        </div>
      )}
      <AlertDialog open={dialog !== null} onOpenChange={(open) => { if (!open) onKeepWriting(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogCopy?.title}</AlertDialogTitle>
            <AlertDialogDescription className='body2-regular'>
              {dialogCopy?.lines[0]}
              <br />
              {dialogCopy?.lines[1]}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>계속 작성하기</AlertDialogCancel>
            <AlertDialogAction onClick={dialog === 'save' ? onConfirmSave : onLeave}>{dialogCopy?.confirmLabel}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export { GuardianDiaryGenerateForm };
export type { GuardianDiaryGenerateFormProps };
