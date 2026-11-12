'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { overlay } from 'overlay-kit';

import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';
import { useGuardianSelectedPetStore } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPetStore';
import { useGuardianCalendarDay } from '@views/guardian-kindergarten-page/model/useGuardianCalendarDay';
import { useStackNavigation } from '@shared/lib/bridge';
import { startOfDay } from '@shared/lib/calendar-date';

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
import { DiaryPhotoSourceSheet } from './DiaryPhotoSourceSheet';
import { GuardianDiaryWriteForm } from './GuardianDiaryWriteForm';

function GuardianDiaryWritePage() {
  const searchParams = useSearchParams();
  const { back } = useStackNavigation();
  const { selectedPet } = useGuardianSelectedPet();
  const storePetId = useGuardianSelectedPetStore((state) => state.selectedPetId);
  const date = useMemo(() => parseDiaryDate(searchParams.get('date')) ?? startOfDay(new Date()), [searchParams]);
  const schoolId = searchParams.get('schoolId');
  const petId = searchParams.get('petId') || storePetId || selectedPet?.id;
  const hintedNotice = searchParams.get('hasNotice') === '1';
  const { dailyNotice } = useGuardianCalendarDay({
    selectedDate: date,
    schoolId,
    petId,
    enabled: Boolean(schoolId) && Boolean(petId),
  });
  const [photos, setPhotos] = useState<DiaryWritePhoto[]>([]);
  const [text, setText] = useState('');
  const [isImported, setIsImported] = useState(false);
  const [isImportDismissed, setIsImportDismissed] = useState(false);
  const { pickPhotos } = useDiaryPhotoPick(photos, setPhotos);
  const notice = dailyNotice;
  const hasNotice = hasMockArrivedNotice(date) || Boolean(notice) || hintedNotice;

  useEffect(() => {
    setIsImportDismissed(hasDismissedDiaryImport());
  }, []);

  const importedNotice =
    isImported && notice ? { date: formatDiaryNoticeDate(date), body: notice.body } : null;

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

  return (
    <GuardianDiaryWriteForm
      dogName={selectedPet?.name || '강아지'}
      photos={photos}
      text={text}
      isTextRequired={!importedNotice}
      isImportVisible={isDiaryImportVisible({
        hasNotice,
        isNoticeReady: true,
        isImported,
        isImportDismissed,
      })}
      importedNotice={importedNotice}
      onAddPhoto={handleAddPhoto}
      onRemovePhoto={(id) => setPhotos((current) => current.filter((photo) => photo.id !== id))}
      onTextChange={setText}
      onDismissImport={handleDismissImport}
      onImportNotice={() => setIsImported(true)}
      onRemoveNotice={handleRemoveNotice}
      onSubmit={() => undefined}
      onBack={() => {
        void back();
      }}
    />
  );
}

export { GuardianDiaryWritePage };
