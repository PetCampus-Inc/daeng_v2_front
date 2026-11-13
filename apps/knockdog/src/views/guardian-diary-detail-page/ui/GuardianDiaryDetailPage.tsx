'use client';

import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import {
  deleteGuardianDiary,
  guardianDiaryDateQueryKey,
  guardianDiaryDetailQueryKey,
  guardianDiaryMonthQueryKey,
  patchGuardianDiary,
  useGuardianDiaryDateQuery,
  useGuardianDiaryDetailQuery,
} from '@entities/guardian-diary';
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

const DIARY_EDIT_FAIL = '일기를 수정하지 못했어요. 잠시 후 다시 시도해주세요';
const DIARY_DELETE_FAIL = '일기를 삭제하지 못했어요. 잠시 후 다시 시도해주세요';

function GuardianDiaryDetailPage() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const isMutatingRef = useRef(false);
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

  function refreshDiaryQueries(nextPetId: string | null, nextDiaryId: string) {
    void queryClient.invalidateQueries({ queryKey: guardianDiaryDetailQueryKey(nextDiaryId) });
    void queryClient.invalidateQueries({ queryKey: guardianDiaryDateQueryKey(nextPetId, dateKey) });
    void queryClient.invalidateQueries({ queryKey: guardianDiaryMonthQueryKey(nextPetId) });
  }

  async function handleDelete() {
    if (isMutatingRef.current) return;
    if (!diaryId) {
      toast({ shape: 'rounded', position: 'bottom', title: DIARY_DELETE_FAIL, nativeTitle: DIARY_DELETE_FAIL });
      return;
    }
    isMutatingRef.current = true;
    try {
      await deleteGuardianDiary(diaryId);
      try {
        removeDiaryRecord(dateKey, detail?.petId ?? record?.petId ?? petId);
      } catch {
        // 서버 삭제는 끝났고, 이 화면의 임시 기록만 실패한 경우다.
      }
      setIsDeleteOpen(false);
      refreshDiaryQueries(detail?.petId ?? petId, diaryId);
      const deleted = formatDiaryDeleteToast(date);
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
    } catch {
      toast({ shape: 'rounded', position: 'bottom', title: DIARY_DELETE_FAIL, nativeTitle: DIARY_DELETE_FAIL });
    } finally {
      isMutatingRef.current = false;
    }
  }

  function handleEdit() {
    setIsMenuOpen(false);
    setBody(shownBody);
    setIsEditing(true);
  }

  async function handleSaveEdit() {
    const nextBody = body ?? shownBody;
    if (!nextBody.trim() || isMutatingRef.current) return;
    if (!diaryId) {
      toast({ shape: 'rounded', position: 'bottom', title: DIARY_EDIT_FAIL, nativeTitle: DIARY_EDIT_FAIL });
      return;
    }
    isMutatingRef.current = true;
    try {
      const updated = await patchGuardianDiary(diaryId, nextBody);
      try {
        saveDiaryRecord({
          dateKey: updated.date,
          petId: updated.petId,
          dogName: record?.dogName || '강아지',
          body: updated.body,
          photos: updated.photos,
        });
      } catch {
        // 서버 수정은 끝났고, 이 화면의 임시 기록만 실패한 경우다.
      }
      queryClient.setQueryData(guardianDiaryDetailQueryKey(diaryId), updated);
      refreshDiaryQueries(updated.petId, diaryId);
      setBody(updated.body);
      setIsEditing(false);
    } catch {
      toast({ shape: 'rounded', position: 'bottom', title: DIARY_EDIT_FAIL, nativeTitle: DIARY_EDIT_FAIL });
    } finally {
      isMutatingRef.current = false;
    }
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
