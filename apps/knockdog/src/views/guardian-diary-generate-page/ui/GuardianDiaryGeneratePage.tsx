'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { guardianDiaryDateQueryKey, guardianDiaryMonthQueryKey, postDiaryGeneration, postDiarySave } from '@entities/guardian-diary';
import { useStackNavigation } from '@shared/lib/bridge';
import { formatDateKey } from '@shared/lib/calendar-date';
import { buildDiaryDetailTarget } from '@shared/lib/diary-write/buildDiaryWriteTarget';
import { readDiaryGenerateDraft } from '@shared/lib/diary-write/diaryGenerateDraft';
import { clearDiaryRemoved, saveDiaryRecord } from '@shared/lib/diary-write/diaryRecord';
import { toast } from '@shared/ui/toast';

import {
  DIARY_GENERATING_TOAST,
  DIARY_WORD_INTERVAL_MS,
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
  const queryClient = useQueryClient();
  const { back, push } = useStackNavigation();
  const draft = useMemo(() => readDiaryGenerateDraft(), []);
  const date = useMemo(() => parseGenerateDate(searchParams.get('date') ?? draft?.date ?? null), [draft?.date, searchParams]);
  const photos = draft?.photos.length ? draft.photos : FALLBACK_PHOTOS;
  const dogName = draft?.dogName || '강아지';
  const forcedError = searchParams.get('result') === 'error' || !draft?.petId;
  const [status, setStatus] = useState<DiaryGenerateStatus>(forcedError ? 'error' : 'generating');
  const [runId, setRunId] = useState(0);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const [visibleBody, setVisibleBody] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasTriedLeave, setHasTriedLeave] = useState(false);
  const [dialog, setDialog] = useState<DiaryGenerateDialog | null>(null);
  const generationRef = useRef<{ runId: number; promise: ReturnType<typeof postDiaryGeneration> } | null>(null);
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (status !== 'generating') return;
    const petId = draft?.petId;
    const dateKey = draft?.date ?? formatDateKey(date);
    if (!petId) return;

    let current = generationRef.current;
    if (!current || current.runId !== runId) {
      current = {
        runId,
        promise: postDiaryGeneration({
          petId,
          date: dateKey,
          idempotencyKey: crypto.randomUUID(),
          photoKeys: draft?.photoKeys ?? [],
          text: draft?.text,
          attendanceRecordId: draft?.attendanceRecordId,
        }),
      };
      generationRef.current = current;
    }

    let ignore = false;
    current.promise
      .then((generation) => {
        if (ignore) return;
        setGenerationId(generation.id);
        setBody(generation.body);
        setStatus('done');
        void queryClient.invalidateQueries({ queryKey: guardianDiaryDateQueryKey(petId, dateKey) });
      })
      .catch(() => {
        if (!ignore) setStatus('error');
      });

    return () => {
      ignore = true;
    };
  }, [date, draft, queryClient, runId, status]);

  useEffect(() => {
    if (status !== 'done' || isEditing || isSaved || !body) return;
    let wordCount = 0;
    const timer = window.setInterval(() => {
      wordCount += 1;
      const nextBody = revealDiaryText(body, wordCount);
      setVisibleBody(nextBody);
      if (nextBody.length >= body.length) window.clearInterval(timer);
    }, DIARY_WORD_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [body, isEditing, isSaved, status]);

  function handleBack() {
    if (status === 'generating') {
      setHasTriedLeave(true);
      toast({
        shape: 'rounded',
        position: 'bottom',
        title: DIARY_GENERATING_TOAST,
        nativeTitle: DIARY_GENERATING_TOAST,
      });
      return;
    }
    if (status === 'done' && !isSaved) {
      setDialog('leave');
      return;
    }
    void back();
  }

  function handleRetry() {
    setGenerationId(null);
    setBody('');
    setVisibleBody('');
    setIsEditing(false);
    setIsSaved(false);
    setHasTriedLeave(false);
    setStatus('generating');
    setRunId((current) => current + 1);
  }

  async function handleConfirmSave() {
    const savedBody = body || visibleBody;
    if (!generationId || isSavingRef.current) return;
    isSavingRef.current = true;
    try {
      const detail = await postDiarySave({ generationId, body: savedBody });
      clearDiaryRemoved(detail.petId, detail.date);
      const saved = getDiarySaveToast(dogName);
      try {
        saveDiaryRecord({ dateKey: detail.date, petId: detail.petId, dogName, body: detail.body, photos: detail.photos });
      } catch {
        // 서버 저장은 끝났고, 이 화면의 임시 기록만 실패한 경우다.
      }
      setDialog(null);
      setIsEditing(false);
      setIsSaved(true);
      void queryClient.invalidateQueries({ queryKey: guardianDiaryMonthQueryKey(detail.petId) });
      void queryClient.invalidateQueries({ queryKey: guardianDiaryDateQueryKey(detail.petId, detail.date) });
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
      void push(buildDiaryDetailTarget({ date, schoolId: searchParams.get('schoolId'), petId: detail.petId, diaryId: detail.id }));
    } catch {
      toast({
        shape: 'rounded',
        position: 'bottom',
        title: '일기를 저장하지 못했어요. 잠시 후 다시 시도해주세요',
        nativeTitle: '일기를 저장하지 못했어요. 잠시 후 다시 시도해주세요',
      });
    } finally {
      isSavingRef.current = false;
    }
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
      hasTriedLeave={hasTriedLeave}
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
