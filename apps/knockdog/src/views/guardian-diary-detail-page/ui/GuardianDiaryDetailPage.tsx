'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { useGuardianDiaryDateQuery, useGuardianDiaryDetailQuery } from '@entities/guardian-diary';
import { formatDateKey } from '@shared/lib/calendar-date';
import { useTabNavigation } from '@shared/lib/bridge';
import { readDiaryRecord, removeDiaryRecord, saveDiaryHomeReturn, saveDiaryRecord } from '@shared/lib/diary-write/diaryRecord';
import { toast } from '@shared/ui/toast';

import { formatDiaryDeleteToast, formatDiaryDetailDate } from '../lib/diaryDetail';
import { GuardianDiaryDetailForm } from './GuardianDiaryDetailForm';

function parseDetailDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date();
  const [yearText, monthText, dayText] = value.split('-');
  return new Date(Number(yearText), Number(monthText) - 1, Number(dayText));
}

function GuardianDiaryDetailPage() {
  const searchParams = useSearchParams();
  const { navigateToTab } = useTabNavigation();
  const date = useMemo(() => parseDetailDate(searchParams.get('date')), [searchParams]);
  const dateKey = formatDateKey(date);
  const petId = searchParams.get('petId');
  const diaryIdFromQuery = searchParams.get('diaryId');
  const { data: dateStatus } = useGuardianDiaryDateQuery({ petId, date: dateKey, enabled: !diaryIdFromQuery });
  const diaryId = diaryIdFromQuery || dateStatus?.diary?.id || null;
  const { data: detail } = useGuardianDiaryDetailQuery({ diaryId });
  const record = useMemo(() => readDiaryRecord(dateKey, petId), [dateKey, petId]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [body, setBody] = useState<string | null>(null);
  const shownBody = body ?? detail?.body ?? record?.body ?? '';
  const photos = detail?.photos ?? record?.photos ?? [];

  function openDiaryHome() {
    saveDiaryHomeReturn(dateKey);
    void navigateToTab('/kindergarten');
  }

  function handleDelete() {
    const deleted = formatDiaryDeleteToast(date);
    removeDiaryRecord(dateKey, record?.petId ?? petId);
    setIsDeleteOpen(false);
    toast({
      type: 'success',
      shape: 'rounded',
      position: 'bottom',
      nativeTitle: deleted.nativeTitle,
      titleParts: [
        { text: deleted.label, accent: true },
        { text: deleted.suffix },
      ],
      title: (
        <>
          <span className='body1-bold text-text-accent'>{deleted.label}</span>
          <span className='text-text-primary-inverse'>{deleted.suffix}</span>
        </>
      ),
    });
    openDiaryHome();
  }

  function handleEdit() {
    setIsMenuOpen(false);
    setBody(shownBody);
    setIsEditing(true);
  }

  function handleSaveEdit() {
    const nextBody = body ?? shownBody;
    if (!nextBody.trim()) return;
    saveDiaryRecord({
      dateKey,
      petId: detail?.petId ?? record?.petId ?? petId ?? null,
      dogName: record?.dogName || '강아지',
      body: nextBody,
      photos,
    });
    setBody(nextBody);
    setIsEditing(false);
  }

  return (
    <GuardianDiaryDetailForm
      dateLabel={formatDiaryDetailDate(date)}
      photos={photos}
      body={shownBody}
      isEditing={isEditing}
      isMenuOpen={isMenuOpen}
      isDeleteOpen={isDeleteOpen}
      onBack={openDiaryHome}
      onMenu={() => setIsMenuOpen((open) => !open)}
      onCloseMenu={() => setIsMenuOpen(false)}
      onEdit={handleEdit}
      onBodyChange={setBody}
      onSave={handleSaveEdit}
      onAskDelete={() => {
        setIsMenuOpen(false);
        setIsDeleteOpen(true);
      }}
      onCancelDelete={() => setIsDeleteOpen(false)}
      onDelete={handleDelete}
    />
  );
}

export { GuardianDiaryDetailPage };
