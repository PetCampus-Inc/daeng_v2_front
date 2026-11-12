'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { useStackNavigation } from '@shared/lib/bridge';
import { readDiaryGenerateDraft } from '@shared/lib/diary-write/diaryGenerateDraft';

import {
  DIARY_GENERATE_DELAY_MS,
  DIARY_WORD_INTERVAL_MS,
  MOCK_DIARY_BODY,
  formatDiaryDateLabel,
  revealDiaryText,
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
  const [isExitOpen, setIsExitOpen] = useState(false);

  useEffect(() => {
    if (status !== 'generating') return;
    const timer = window.setTimeout(() => {
      setBody(MOCK_DIARY_BODY);
      setStatus('done');
    }, DIARY_GENERATE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [runId, status]);

  useEffect(() => {
    if (status !== 'done' || isEditing) return;
    let wordCount = 0;
    const timer = window.setInterval(() => {
      wordCount += 1;
      const nextBody = revealDiaryText(MOCK_DIARY_BODY, wordCount);
      setVisibleBody(nextBody);
      if (nextBody.length >= MOCK_DIARY_BODY.length) window.clearInterval(timer);
    }, DIARY_WORD_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [isEditing, status]);

  function handleBack() {
    if (status === 'generating') {
      setIsExitOpen(true);
      return;
    }
    void back();
  }

  function handleRetry() {
    setBody('');
    setVisibleBody('');
    setIsEditing(false);
    setStatus('generating');
    setRunId((current) => current + 1);
  }

  return (
    <GuardianDiaryGenerateForm
      dogName={dogName}
      dateLabel={formatDiaryDateLabel(date)}
      photos={photos}
      status={status}
      body={isEditing ? body : visibleBody}
      isEditing={isEditing}
      isExitOpen={isExitOpen}
      onBack={handleBack}
      onRetry={handleRetry}
      onEdit={() => setIsEditing(true)}
      onBodyChange={setBody}
      onSave={() => undefined}
      onKeepWriting={() => setIsExitOpen(false)}
      onLeave={() => {
        setIsExitOpen(false);
        void back();
      }}
    />
  );
}

export { GuardianDiaryGeneratePage };
