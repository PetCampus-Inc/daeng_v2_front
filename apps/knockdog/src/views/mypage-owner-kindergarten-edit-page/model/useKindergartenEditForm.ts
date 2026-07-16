'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useOwnerKindergarten } from '@features/role-conversion';
import { formatPhone } from '@features/role-conversion/lib/formatKindergartenRegisterField';
import { CLOSED_DAYS } from '@entities/compare';
import type { FilterOption } from '@entities/kindergarten';
import { usePutOwnerSchoolProfileMutation } from '@entities/owner-school';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { useMoveImageMutation, type WebImageAsset } from '@shared/lib/media';
import { toast } from '@shared/ui/toast';
import { buildOwnerSchoolProfilePayload } from '@views/mypage-owner-kindergarten-edit-page/lib/buildOwnerSchoolProfilePayload';
import {
  clearEditFormDraft,
  EDIT_FORM_DRAFT_UPDATED_EVENT,
  loadEditFormDraft,
  saveEditFormDraft,
  type EditFormDraft,
} from '@views/mypage-owner-kindergarten-edit-page/lib/editFormDraft';
import { mapToEditFormDraft } from '@views/mypage-owner-kindergarten-edit-page/lib/mapToEditFormDraft';

type TimeFieldKey = 'weekdayStart' | 'weekdayEnd' | 'weekendStart' | 'weekendEnd';

function applyDraftToState(
  draft: EditFormDraft,
  setters: {
    setImages: (value: WebImageAsset[]) => void;
    setName: (value: string) => void;
    setAddress: (value: string) => void;
    setAddressDetail: (value: string) => void;
    setPhone: (value: string) => void;
    setWeekdayStart: (value: string | null) => void;
    setWeekdayEnd: (value: string | null) => void;
    setWeekendStart: (value: string | null) => void;
    setWeekendEnd: (value: string | null) => void;
    setClosedDays: (value: string[]) => void;
    setHomepage: (value: string) => void;
    setInstagram: (value: string) => void;
    setYoutube: (value: string) => void;
    setBreeds: (value: FilterOption[]) => void;
    setDogServices: (value: FilterOption[]) => void;
    setSafetyFacilities: (value: FilterOption[]) => void;
    setAmenities: (value: FilterOption[]) => void;
    setLastUpdatedDate: (value: string | null) => void;
    setIsDirty: (value: boolean) => void;
  }
) {
  setters.setImages(draft.images as WebImageAsset[]);
  setters.setName(draft.name);
  setters.setAddress(draft.address);
  setters.setAddressDetail(draft.addressDetail);
  setters.setPhone(draft.phone);
  setters.setWeekdayStart(draft.weekdayStart);
  setters.setWeekdayEnd(draft.weekdayEnd);
  setters.setWeekendStart(draft.weekendStart);
  setters.setWeekendEnd(draft.weekendEnd);
  setters.setClosedDays(draft.closedDays);
  setters.setHomepage(draft.homepage);
  setters.setInstagram(draft.instagram);
  setters.setYoutube(draft.youtube);
  setters.setBreeds(draft.breeds);
  setters.setDogServices(draft.dogServices);
  setters.setSafetyFacilities(draft.safetyFacilities);
  setters.setAmenities(draft.amenities);
  setters.setLastUpdatedDate(draft.lastUpdatedDate);
  setters.setIsDirty(draft.isDirty);
}

function useKindergartenEditForm() {
  const { back, push } = useStackNavigation();
  const {
    source,
    kindergartenId,
    autofillName: kindergartenName,
    autofillStreetAddress: kindergartenAddress,
    autofillAddressDetail: kindergartenAddressDetail,
    autofillPhoneNumber: phoneNumber,
    autofillBannerKeys: bannerKeys,
    autofillBasic: basic,
    canUseAutofill,
    isAutofillPrefillReady,
  } = useOwnerKindergarten();

  const isSelected = source === 'search';
  const { mutateAsync: moveImageAsync } = useMoveImageMutation();
  const { mutateAsync: putProfileAsync, isPending: isSaving } = usePutOwnerSchoolProfileMutation({
    kindergartenId: isSelected ? kindergartenId : undefined,
  });

  // SSR/CSR 첫 paint는 empty, draft/API는 mount 후 복원
  const [images, setImages] = useState<WebImageAsset[]>([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [phone, setPhone] = useState('');
  const [weekdayStart, setWeekdayStart] = useState<string | null>(null);
  const [weekdayEnd, setWeekdayEnd] = useState<string | null>(null);
  const [weekendStart, setWeekendStart] = useState<string | null>(null);
  const [weekendEnd, setWeekendEnd] = useState<string | null>(null);
  const [closedDays, setClosedDays] = useState<string[]>([]);
  const [activeTimeField, setActiveTimeField] = useState<TimeFieldKey | null>(null);
  const [isClosedDaysSheetOpen, setIsClosedDaysSheetOpen] = useState(false);
  const [homepage, setHomepage] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');
  const [breeds, setBreeds] = useState<FilterOption[]>([]);
  const [dogServices, setDogServices] = useState<FilterOption[]>([]);
  const [safetyFacilities, setSafetyFacilities] = useState<FilterOption[]>([]);
  const [amenities, setAmenities] = useState<FilterOption[]>([]);
  const [lastUpdatedDate, setLastUpdatedDate] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const skipNextPersistRef = useRef(false);
  const hasHydratedDraftRef = useRef(false);
  const hasHydratedFromSourceRef = useRef(false);
  const isSaveLockedRef = useRef(false);
  const [isPreparingSave, setIsPreparingSave] = useState(false);
  const prefillSourceRef = useRef({
    canUseAutofill,
    isAutofillPrefillReady,
    kindergartenName,
    kindergartenAddress,
    kindergartenAddressDetail,
    phoneNumber,
    basic,
    bannerKeys,
  });

  prefillSourceRef.current = {
    canUseAutofill,
    isAutofillPrefillReady,
    kindergartenName,
    kindergartenAddress,
    kindergartenAddressDetail,
    phoneNumber,
    basic,
    bannerKeys,
  };

  const draftSetters = {
    setImages,
    setName,
    setAddress,
    setAddressDetail,
    setPhone,
    setWeekdayStart,
    setWeekdayEnd,
    setWeekendStart,
    setWeekendEnd,
    setClosedDays,
    setHomepage,
    setInstagram,
    setYoutube,
    setBreeds,
    setDogServices,
    setSafetyFacilities,
    setAmenities,
    setLastUpdatedDate,
    setIsDirty,
  };

  const buildDraft = (
    nextIsDirty: boolean,
    overrides: Partial<EditFormDraft> = {}
  ): EditFormDraft => ({
    images: images as EditFormDraft['images'],
    name,
    address,
    addressDetail,
    phone,
    weekdayStart,
    weekdayEnd,
    weekendStart,
    weekendEnd,
    closedDays,
    homepage,
    instagram,
    youtube,
    breeds,
    dogServices,
    safetyFacilities,
    amenities,
    lastUpdatedDate,
    isDirty: nextIsDirty,
    ...overrides,
  });

  const persistDraft = (nextIsDirty: boolean, overrides: Partial<EditFormDraft> = {}) => {
    saveEditFormDraft(buildDraft(nextIsDirty, overrides));
  };

  useEffect(() => {
    function syncDraftFromStorage() {
      if (document.visibilityState === 'hidden') return;

      const draft = loadEditFormDraft();

      // 미저장 편집 draft만 복원. SELECTED 실데이터는 '자동 채우기'로 프리필
      if (draft?.isDirty) {
        skipNextPersistRef.current = true;
        applyDraftToState(draft, draftSetters);
      }

      hasHydratedDraftRef.current = true;
      hasHydratedFromSourceRef.current = true;
    }

    syncDraftFromStorage();

    window.addEventListener('pageshow', syncDraftFromStorage);
    window.addEventListener(EDIT_FORM_DRAFT_UPDATED_EVENT, syncDraftFromStorage);
    document.addEventListener('visibilitychange', syncDraftFromStorage);

    return () => {
      window.removeEventListener('pageshow', syncDraftFromStorage);
      window.removeEventListener(EDIT_FORM_DRAFT_UPDATED_EVENT, syncDraftFromStorage);
      document.removeEventListener('visibilitychange', syncDraftFromStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount 시 draft 동기화만
  }, []);

  useEffect(() => {
    if (!hasHydratedDraftRef.current) return;
    if (!hasHydratedFromSourceRef.current) return;

    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    persistDraft(isDirty);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 폼 필드 변경 시에만 draft 저장
  }, [
    images,
    name,
    address,
    addressDetail,
    phone,
    weekdayStart,
    weekdayEnd,
    weekendStart,
    weekendEnd,
    closedDays,
    homepage,
    instagram,
    youtube,
    breeds,
    dogServices,
    safetyFacilities,
    amenities,
    lastUpdatedDate,
    isDirty,
  ]);

  const markDirty = () => {
    if (!isDirty) setIsDirty(true);
  };

  const updateField = <T,>(setter: (value: T) => void, value: T) => {
    markDirty();
    setter(value);
  };

  const activeTimeValue = useMemo(() => {
    if (!activeTimeField) return null;
    const timeMap: Record<TimeFieldKey, string | null> = {
      weekdayStart,
      weekdayEnd,
      weekendStart,
      weekendEnd,
    };
    return timeMap[activeTimeField];
  }, [activeTimeField, weekdayStart, weekdayEnd, weekendStart, weekendEnd]);

  const closedDaysLabel = useMemo(
    () =>
      closedDays
        .map((day) => CLOSED_DAYS[day as keyof typeof CLOSED_DAYS] ?? day)
        .join(', '),
    [closedDays]
  );

  const isSaveEnabled =
    images.length > 0 &&
    name.trim().length > 0 &&
    address.trim().length > 0 &&
    phone.trim().length > 0 &&
    Boolean(weekdayStart) &&
    Boolean(weekdayEnd) &&
    Boolean(weekendStart) &&
    Boolean(weekendEnd);

  const handleLeaveWithoutSaving = () => {
    clearEditFormDraft();
    back?.();
  };

  const leaveIfClean = () => {
    if (isDirty) return false;
    back?.();
    return true;
  };

  const handleAddressSearch = async () => {
    persistDraft(true);
    setIsDirty(true);

    await push({
      pathname: route.mypage.kindergarten.edit.address.root,
    });
  };

  const handleSave = async () => {
    if (!isSaveEnabled || isSaving || isPreparingSave || isSaveLockedRef.current) return false;

    isSaveLockedRef.current = true;
    setIsPreparingSave(true);

    try {
      const payload = await buildOwnerSchoolProfilePayload({
        draft: buildDraft(false),
        moveImage: moveImageAsync,
      });

      await putProfileAsync(payload);

      skipNextPersistRef.current = true;
      clearEditFormDraft();
      setIsDirty(false);
      back?.();
      return true;
    } catch (error) {
      console.error('[operation edit save]', error);
      toast({
        type: 'default',
        shape: 'rounded',
        position: 'bottom',
        title: '운영 정보 저장에 실패했어요',
        description: error instanceof Error ? error.message : undefined,
      });
      return false;
    } finally {
      isSaveLockedRef.current = false;
      setIsPreparingSave(false);
    }
  };

  const handleTimeSelect = (value: string) => {
    if (!activeTimeField) return;

    const settersByField: Record<TimeFieldKey, (next: string | null) => void> = {
      weekdayStart: setWeekdayStart,
      weekdayEnd: setWeekdayEnd,
      weekendStart: setWeekendStart,
      weekendEnd: setWeekendEnd,
    };
    updateField(settersByField[activeTimeField], value);
  };

  /**
   * 자동 채우기 완료 시 폼 채움
   * - 저장본(schoolProfileId) 있으면: school profile 최신값
   * - 없으면 SELECTED: place basic/main
   */
  const applySelectedPrefill = () => {
    const source = prefillSourceRef.current;
    if (!source.canUseAutofill || !source.isAutofillPrefillReady) return false;

    const next = {
      ...mapToEditFormDraft({
        name: source.kindergartenName,
        address: source.kindergartenAddress,
        addressDetail: source.kindergartenAddressDetail,
        phone: formatPhone(source.phoneNumber),
        basic: source.basic,
        bannerKeys: source.bannerKeys,
        lastUpdatedDate: source.basic?.lastUpdatedAt?.trim() || null,
      }),
      isDirty: true,
    };

    skipNextPersistRef.current = true;
    applyDraftToState(next, draftSetters);
    saveEditFormDraft(next);
    hasHydratedFromSourceRef.current = true;
    return true;
  };

  return {
    isSelected,
    canUseAutofill,
    images,
    name,
    address,
    addressDetail,
    phone,
    weekdayStart,
    weekdayEnd,
    weekendStart,
    weekendEnd,
    closedDays,
    closedDaysLabel,
    activeTimeField,
    activeTimeValue,
    isClosedDaysSheetOpen,
    homepage,
    instagram,
    youtube,
    breeds,
    dogServices,
    safetyFacilities,
    amenities,
    lastUpdatedDate,
    isDirty,
    isSaveEnabled,
    isSaving: isSaving || isPreparingSave,
    setActiveTimeField,
    setIsClosedDaysSheetOpen,
    closeTimeSheet: () => setActiveTimeField(null),
    closeClosedDaysSheet: () => setIsClosedDaysSheetOpen(false),
    handleImagesChange: (next: WebImageAsset[]) => updateField(setImages, next),
    handleNameChange: (value: string) => updateField(setName, value),
    handleAddressDetailChange: (value: string) => updateField(setAddressDetail, value),
    handlePhoneChange: (value: string) => updateField(setPhone, formatPhone(value)),
    handleHomepageChange: (value: string) => updateField(setHomepage, value),
    handleInstagramChange: (value: string) => updateField(setInstagram, value),
    handleYoutubeChange: (value: string) => updateField(setYoutube, value),
    handleBreedsChange: (next: FilterOption[]) => updateField(setBreeds, next),
    handleDogServicesChange: (next: FilterOption[]) => updateField(setDogServices, next),
    handleSafetyFacilitiesChange: (next: FilterOption[]) =>
      updateField(setSafetyFacilities, next),
    handleAmenitiesChange: (next: FilterOption[]) => updateField(setAmenities, next),
    handleClosedDaysChange: (next: string[]) => updateField(setClosedDays, next),
    leaveIfClean,
    handleLeaveWithoutSaving,
    handleAddressSearch,
    handleClearAddress: () => {
      markDirty();
      setAddress('');
      setAddressDetail('');
    },
    handleSave,
    handleTimeSelect,
    applySelectedPrefill,
    getIsSelectedPrefillReady: () => prefillSourceRef.current.isAutofillPrefillReady,
  };
}

export { useKindergartenEditForm, type TimeFieldKey };
