'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { overlay } from 'overlay-kit';

import { useGuardianDiaryDateQuery } from '@entities/guardian-diary';
import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';
import { useGuardianSelectedPetStore } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPetStore';
import { useGuardianCalendarDay } from '@views/guardian-kindergarten-page/model/useGuardianCalendarDay';
import { useStackNavigation } from '@shared/lib/bridge';
import { formatDateKey, startOfDay } from '@shared/lib/calendar-date';
import { buildDiaryGenerateTarget } from '@shared/lib/diary-write/buildDiaryWriteTarget';
import { saveDiaryGenerateDraft } from '@shared/lib/diary-write/diaryGenerateDraft';
import { toast } from '@shared/ui/toast';

import {
  DIARY_PHOTO_LIMIT,
  dismissDiaryImport,
  formatDiaryNoticeDate,
  hasDismissedDiaryImport,
  hasMockArrivedNotice,
  isDiaryImportVisible,
  parseDiaryDate,
  type DiaryWritePhoto,
} from '../lib/diaryWriteForm';
import { useDiaryPhotoPick } from '../model/useDiaryPhotoPick';
import { DiaryNoticeImportSheet } from './DiaryNoticeImportSheet';
import { DiaryPhotoSourceSheet } from './DiaryPhotoSourceSheet';
import { GuardianDiaryWriteForm } from './GuardianDiaryWriteForm';

function GuardianDiaryWritePage() {
  const searchParams = useSearchParams();
  const { back, push } = useStackNavigation();
  const { selectedPet } = useGuardianSelectedPet();
  const storePetId = useGuardianSelectedPetStore((state) => state.selectedPetId);
  const date = useMemo(() => parseDiaryDate(searchParams.get('date')) ?? startOfDay(new Date()), [searchParams]);
  const dateKey = formatDateKey(date);
  const schoolId = searchParams.get('schoolId');
  const petId = selectedPet?.id ?? searchParams.get('petId');
  const { data: dateStatus } = useGuardianDiaryDateQuery({ petId, date: dateKey });
  const { dailyNotice } = useGuardianCalendarDay({
    selectedDate: date,
    schoolId,
    petId: storePetId,
  });
  const [photos, setPhotos] = useState<DiaryWritePhoto[]>([]);
  const [text, setText] = useState('');
  const [isImported, setIsImported] = useState(false);
  const [isImportDismissed, setIsImportDismissed] = useState(false);
  const [isImportSheetOpen, setIsImportSheetOpen] = useState(false);
  const { pickPhotos } = useDiaryPhotoPick(photos, setPhotos);
  const noticeBody = dateStatus?.attendance?.note || dailyNotice?.body;
  const hasNotice = dateStatus ? Boolean(dateStatus.attendance) : hasMockArrivedNotice(date) || Boolean(dailyNotice);

  useEffect(() => {
    setIsImportDismissed(hasDismissedDiaryImport());
  }, []);

  const importedNotice = isImported ? { date: formatDiaryNoticeDate(date), body: noticeBody } : null;

  function handleAddPhoto() {
    if (photos.length >= DIARY_PHOTO_LIMIT) return;
    overlay.open(({ isOpen, close }) => (
      <DiaryPhotoSourceSheet
        isOpen={isOpen}
        onClose={close}
        onSelect={(source) => {
          close();
          void pickPhotos(source);
        }}
      />
    ));
  }

  function handleDismissImport() {
    dismissDiaryImport();
    setIsImportDismissed(true);
  }

  function handleRemoveNotice() {
    setIsImported(false);
    handleDismissImport();
  }

  function handleCreateDiary(includeNotice?: boolean) {
    const withNotice = includeNotice === true || isImported;
    setIsImportSheetOpen(false);
    try {
      saveDiaryGenerateDraft({
        date: dateKey,
        dogName: selectedPet?.name || '강아지',
        petId,
        photos: photos.map((photo) => photo.src),
        photoKeys: photos.flatMap((photo) => (photo.tempKey ? [photo.tempKey] : [])),
        text: text.trim(),
        attendanceRecordId: withNotice ? dateStatus?.attendance?.id ?? null : null,
      });
    } catch {
      toast({
        title: '일기를 만들지 못했어요. 잠시 후 다시 시도해주세요',
        position: 'bottom-above-nav',
      });
      return;
    }
    push(buildDiaryGenerateTarget({ date, schoolId, petId }));
  }

  function handleApplyImport() {
    setIsImportSheetOpen(false);
    setIsImported(true);
  }

  return (
    <>
      <GuardianDiaryWriteForm
        dogName={selectedPet?.name || '강아지'}
        photos={photos}
        text={text}
        isTextRequired={!importedNotice}
        isImportVisible={isDiaryImportVisible({
          hasNotice,
          isImported,
          isImportDismissed,
        })}
        importedNotice={importedNotice}
        onAddPhoto={handleAddPhoto}
        onRemovePhoto={(id) => setPhotos((current) => current.filter((photo) => photo.id !== id))}
        onTextChange={setText}
        onDismissImport={handleDismissImport}
        onImportNotice={() => setIsImportSheetOpen(true)}
        onRemoveNotice={handleRemoveNotice}
        onSubmit={handleCreateDiary}
        onBack={() => {
          void back();
        }}
      />
      <DiaryNoticeImportSheet
        isOpen={isImportSheetOpen}
        hasPhoto={photos.length > 0}
        date={formatDiaryNoticeDate(date)}
        body={noticeBody}
        onClose={() => setIsImportSheetOpen(false)}
        onAddToDiary={handleApplyImport}
        onCreateDiary={() => handleCreateDiary(true)}
      />
    </>
  );
}

export { GuardianDiaryWritePage };
