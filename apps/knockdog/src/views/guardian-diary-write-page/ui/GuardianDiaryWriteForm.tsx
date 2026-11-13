'use client';

import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { ActionButton, DiaryImportBanner, DiaryKindergartenNote, DiaryPhotoAdd, DiaryTopBar } from '@knockdog/ui';

import {
  DIARY_PHOTO_LIMIT,
  DIARY_PROMPT_INTERVAL_MS,
  DIARY_TEXT_LIMIT,
  DIARY_TEXT_PLACEHOLDER,
  buildDiaryPrompts,
  canSubmitDiary,
  type DiaryWriteNotice,
  type DiaryWritePhoto,
} from '../lib/diaryWriteForm';

interface GuardianDiaryWriteFormProps {
  dogName: string;
  photos: DiaryWritePhoto[];
  text: string;
  isTextRequired: boolean;
  isImportVisible: boolean;
  importedNotice?: DiaryWriteNotice | null;
  onAddPhoto: () => void;
  onRemovePhoto: (id: string) => void;
  onTextChange: (value: string) => void;
  onDismissImport: () => void;
  onImportNotice: () => void;
  onRemoveNotice: () => void;
  onSubmit: () => void;
  onBack: () => void;
}

function useDiaryPrompt(dogName: string) {
  const prompts = useMemo(() => buildDiaryPrompts(dogName), [dogName]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % prompts.length);
    }, DIARY_PROMPT_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [prompts]);

  return prompts[index] ?? prompts[0];
}

function DiaryFieldLabel({
  htmlFor,
  isRequired = true,
  isOptional = false,
  children,
}: {
  htmlFor?: string;
  isRequired?: boolean;
  isOptional?: boolean;
  children: string;
}) {
  const content = (
    <>
      <span className='body1-bold text-text-primary'>{children}</span>
      {isRequired ? <span className='body2-bold text-text-accent'>*</span> : null}
      {isOptional ? <span className='caption1-semibold text-fill-secondary-500'>(선택)</span> : null}
    </>
  );

  if (!htmlFor) return <p className='flex items-center gap-0.5'>{content}</p>;

  return (
    <label htmlFor={htmlFor} className='flex items-center gap-0.5'>
      {content}
    </label>
  );
}

function GuardianDiaryWriteForm({
  dogName,
  photos,
  text,
  isTextRequired,
  isImportVisible,
  importedNotice = null,
  onAddPhoto,
  onRemovePhoto,
  onTextChange,
  onDismissImport,
  onImportNotice,
  onRemoveNotice,
  onSubmit,
  onBack,
}: GuardianDiaryWriteFormProps) {
  const prompt = useDiaryPrompt(dogName);
  const canSubmit = canSubmitDiary(photos.length, text, isTextRequired);
  const textLabel = `오늘 ${dogName}의 하루는 어땠나요?`;

  function handleTextChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onTextChange(event.target.value.slice(0, DIARY_TEXT_LIMIT));
  }

  return (
    <div className='bg-bg-0 flex min-h-0 flex-1 flex-col'>
      <DiaryTopBar mode='plain' title='일기 쓰기' onBack={onBack} />
      <div className='px-x4 pt-x6 gap-x10 flex min-h-0 flex-1 flex-col overflow-y-auto'>
        <section className='flex flex-col gap-3'>
          <DiaryFieldLabel>{`${dogName}의 하루가 담긴 사진을 올려주세요`}</DiaryFieldLabel>
          <div className='flex gap-4'>
            {photos.map((photo) => (
              <DiaryPhotoAdd
                key={photo.id}
                image={<img src={photo.src} alt='' className='size-full object-cover' />}
                onRemove={() => onRemovePhoto(photo.id)}
              />
            ))}
            {photos.length < DIARY_PHOTO_LIMIT ? (
              <DiaryPhotoAdd count={photos.length} maxCount={DIARY_PHOTO_LIMIT} onAdd={onAddPhoto} />
            ) : null}
          </div>
        </section>

        <section className='flex flex-col gap-3'>
          <DiaryFieldLabel htmlFor='diary-write-text' isRequired={isTextRequired} isOptional={!isTextRequired}>
            {textLabel}
          </DiaryFieldLabel>
          <div className='bg-bg-50 radius-r2 px-x4 py-x3 flex w-full flex-col'>
            <textarea
              id='diary-write-text'
              value={text}
              maxLength={DIARY_TEXT_LIMIT}
              placeholder={DIARY_TEXT_PLACEHOLDER}
              onChange={handleTextChange}
              className='body1-regular text-text-primary placeholder:text-text-tertiary h-[108px] w-full resize-none overflow-y-auto bg-transparent outline-none'
            />
            <div className='flex items-center justify-between gap-2'>
              <span className='body2-regular text-text-caption shrink-0'>
                {text.length}/{DIARY_TEXT_LIMIT}
              </span>
              <p className='caption1-regular text-text-accent h-[19px] min-w-0 flex-1 truncate text-right leading-[18px]'>
                {prompt}
              </p>
            </div>
          </div>
        </section>

        {isImportVisible ? (
          <DiaryImportBanner dogName={dogName} onImport={onImportNotice} onDismiss={onDismissImport} />
        ) : null}
        {importedNotice ? (
          <section className='gap-x2 flex flex-col'>
            <p className='body2-bold text-text-primary'>오늘의 알림장</p>
            <DiaryKindergartenNote date={importedNotice.date} body={importedNotice.body} onRemove={onRemoveNotice} />
          </section>
        ) : null}
      </div>
      <div className='px-x4 pt-x4 pb-x4'>
        <ActionButton type='button' variant='primaryFill' size='large' disabled={!canSubmit} onClick={onSubmit}>
          일기 만들기
        </ActionButton>
      </div>
    </div>
  );
}

export { GuardianDiaryWriteForm };
export type { GuardianDiaryWriteFormProps };
