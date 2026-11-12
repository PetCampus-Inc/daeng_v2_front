'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { useStackNavigation } from '@shared/lib/bridge';
import { readDiaryGenerateDraft } from '@shared/lib/diary-write/diaryGenerateDraft';
import { toast } from '@shared/ui/toast';

import {
  DIARY_GENERATE_DELAY_MS,
  DIARY_WORD_INTERVAL_MS,
  MOCK_DIARY_BODY,
  formatDiaryDateLabel,
  getDiarySaveToast,
  revealDiaryText,
  type DiaryGenerateDialog,
  type DiaryGenerateStatus,
} from '../lib/diaryGenerate';
import { GuardianDiaryGenerateForm } from './GuardianDiaryGenerateForm';

const FALLBACK_PHOTOS = ['/images/diary-sample/leaf.png', '/images/diary-sample/flower.png', '/images/diary-sample/sister.png'];

function parseGenerateDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date();
  const [yearText, monthText, dayText] = value.split('-');
  return new Date(Number(yearText), Number(monthText) - 1, Number(dayText));
}

function GuardianDiaryGeneratePage() {
  const searchParams = useSearchParams();
  const { back } = useStackNavigation();
  const draft = useMemo(() => readDiaryGenerateDraft(), []);
  const date = useMemo(() => parseGenerateDate(searchParams.get('date') ?? draft?.date ?? null), [draft?.date, searchParams]);
  const photos = draft?.photos.length ? draft.photos : FALLBACK_PHOTOS;
  const dogName = draft?.dogName || '강아지';
  const forcedError = searchParams.get('result') === 'error';
  const [status, setStatus] = useState<DiaryGenerateStatus>(forcedError ? 'error' : 'generating');
  const [runId, setRunId] = useState(0);
  const [body, setBody] = useState('');
  const [visibleBody, setVisibleBody] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [dialog, setDialog] = useState<DiaryGenerateDialog | null>(null);

  useEffect(() => {
    if (status !== 'generating') return;
    const timer = window.setTimeout(() => {
      setBody(MOCK_DIARY_BODY);
      setStatus('done');
    }, DIARY_GENERATE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [runId, status]);

  useEffect(() => {
    if (status !== 'done' || isEditing || isSaved) return;
    let wordCount = 0;
    const timer = window.setInterval(() => {
      wordCount += 1;
      const nextBody = revealDiaryText(MOCK_DIARY_BODY, wordCount);
      setVisibleBody(nextBody);
      if (nextBody.length >= MOCK_DIARY_BODY.length) window.clearInterval(timer);
    }, DIARY_WORD_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [isEditing, isSaved, status]);

  function handleBack() {
    if (status === 'generating') {
      setDialog('stop');
      return;
    }
    if (status === 'done' && !isSaved) {
      setDialog('leave');
      return;
    }
    void back();
  }

  function handleRetry() {
    setBody('');
    setVisibleBody('');
    setIsEditing(false);
    setIsSaved(false);
    setStatus('generating');
    setRunId((current) => current + 1);
  }

  function handleConfirmSave() {
    const saved = getDiarySaveToast(dogName);
    setDialog(null);
    setIsEditing(false);
    setIsSaved(true);
    toast({
      type: 'success',
      shape: 'rounded',
      position: 'bottom',
      nativeTitle: saved.nativeTitle,
      titleParts: [
        { text: saved.name, accent: true },
        { text: saved.suffix },
      ],
      title: (
        <>
          <span className='body1-bold text-text-accent'>{saved.name}</span>
          <span className='text-text-primary-inverse'>{saved.suffix}</span>
        </>
      ),
    });
  }

  return (
    <GuardianDiaryGenerateForm
      dogName={dogName}
      dateLabel={formatDiaryDateLabel(date)}
      photos={photos}
      status={status}
      body={isEditing || isSaved ? body : visibleBody}
      isEditing={isEditing}
      isSaved={isSaved}
      dialog={dialog}
      onBack={handleBack}
      onRetry={handleRetry}
      onEdit={() => setIsEditing(true)}
      onBodyChange={setBody}
      onSave={() => setDialog('save')}
      onConfirmSave={handleConfirmSave}
      onKeepWriting={() => setDialog(null)}
      onLeave={() => {
        setDialog(null);
        void back();
      }}
    />
  );
}

export { GuardianDiaryGeneratePage };
