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

import { DIARY_ERROR_TEXT, DIARY_LOADING_TEXT, getGenerateButtonLabel, type DiaryGenerateStatus } from '../lib/diaryGenerate';

interface GuardianDiaryGenerateFormProps {
  dogName: string;
  dateLabel: string;
  photos: string[];
  status: DiaryGenerateStatus;
  body: string;
  isEditing: boolean;
  isExitOpen: boolean;
  onBack: () => void;
  onRetry: () => void;
  onEdit: () => void;
  onBodyChange: (body: string) => void;
  onSave: () => void;
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
  isExitOpen,
  onBack,
  onRetry,
  onEdit,
  onBodyChange,
  onSave,
  onKeepWriting,
  onLeave,
}: GuardianDiaryGenerateFormProps) {
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
        {status === 'done' ? (
          <DiaryEditText body={body} isEditing={isEditing} onEdit={onEdit} onBodyChange={isEditing ? onBodyChange : undefined} />
        ) : null}
      </div>
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
            {getGenerateButtonLabel(dogName, isExitOpen)}
          </ActionButton>
        ) : null}
      </div>
      <AlertDialog open={isExitOpen} onOpenChange={(open) => { if (!open) onKeepWriting(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>일기 쓰기를 멈출까요?</AlertDialogTitle>
            <AlertDialogDescription className='body2-regular'>
              AI 일기는 하루에 세 번만 만들 수 있어요.
              <br />
              지금 나가면 남은 횟수는 1회 줄어요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>계속 작성하기</AlertDialogCancel>
            <AlertDialogAction onClick={onLeave}>나가기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export { GuardianDiaryGenerateForm };
export type { GuardianDiaryGenerateFormProps };
