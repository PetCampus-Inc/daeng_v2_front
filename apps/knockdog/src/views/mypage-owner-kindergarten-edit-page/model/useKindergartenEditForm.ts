'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { buildOwnerSchoolProfilePayload } from '@views/mypage-owner-kindergarten-edit-page/lib/buildOwnerSchoolProfilePayload';
import {
  clearEditFormDraft,
  EDIT_FORM_DRAFT_UPDATED_EVENT,
  loadEditFormDraft,
  saveEditFormDraft,
  type EditFormDraft,
} from '@views/mypage-owner-kindergarten-edit-page/lib/editFormDraft';
import { mapToEditFormDraft } from '@views/mypage-owner-kindergarten-edit-page/lib/mapToEditFormDraft';
import { isValidWebAddressFormat } from '@views/mypage-owner-kindergarten-edit-page/lib/isValidWebAddressFormat';

import { ownerMypageContent, useOwnerKindergarten } from '@features/role-conversion';
import {
  formatName,
  formatPhone,
  isValidKindergartenPhone,
} from '@features/role-conversion/lib/formatKindergartenRegisterField';
import { CLOSED_DAYS } from '@entities/compare';
import { sortDaysOfWeek } from '@shared/constants';
import type { FilterOption } from '@entities/kindergarten';
import { usePutOwnerSchoolProfileMutation } from '@entities/owner-school';
import { useStackNavigation } from '@shared/lib/bridge';
import { useMoveImageMutation, type WebImageAsset } from '@shared/lib/media';
import { toast } from '@shared/ui/toast';

type TimeFieldKey = 'weekdayStart' | 'weekdayEnd' | 'weekendStart' | 'weekendEnd';
type WebAddressField = 'homepage' | 'instagram' | 'youtube';

const WEB_ADDRESS_FORMAT_ERROR = ownerMypageContent.kindergartenEditWebAddressFormatError;
const PHONE_FORMAT_ERROR = ownerMypageContent.kindergartenEditPhoneFormatError;
const WEEKDAY_OPERATING_HOURS_ERROR = ownerMypageContent.kindergartenEditWeekdayOperatingHoursError;
const WEEKEND_OPERATING_HOURS_ERROR = ownerMypageContent.kindergartenEditWeekendOperatingHoursError;

function isDayOperatingHoursComplete(start: string | null, end: string | null) {
  return Boolean(start && end);
}

function isOperatingHoursComplete(
  weekdayStart: string | null,
  weekdayEnd: string | null,
  weekendStart: string | null,
  weekendEnd: string | null
) {
  return (
    isDayOperatingHoursComplete(weekdayStart, weekdayEnd) &&
    isDayOperatingHoursComplete(weekendStart, weekendEnd)
  );
}

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
  setters.setName(formatName(draft.name));
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

/** 빈 dirty draft는 이전 레이스 잔재 — source 프리필을 막지 않음 */
function isMeaningfulEditDraft(draft: EditFormDraft) {
  return (
    draft.images.length > 0 ||
    draft.name.trim().length > 0 ||
    draft.address.trim().length > 0 ||
    draft.addressDetail.trim().length > 0 ||
    draft.phone.trim().length > 0 ||
    Boolean(draft.weekdayStart) ||
    Boolean(draft.weekdayEnd) ||
    Boolean(draft.weekendStart) ||
    Boolean(draft.weekendEnd) ||
    draft.closedDays.length > 0 ||
    draft.homepage.trim().length > 0 ||
    draft.instagram.trim().length > 0 ||
    draft.youtube.trim().length > 0 ||
    draft.breeds.length > 0 ||
    draft.dogServices.length > 0 ||
    draft.safetyFacilities.length > 0 ||
    draft.amenities.length > 0
  );
}

function useKindergartenEditForm() {
  const { back } = useStackNavigation();
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
    isResolved,
    isProfileLoading,
    isProfileError,
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
  const [phoneError, setPhoneError] = useState<string | undefined>();
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
  const [webAddressErrors, setWebAddressErrors] = useState<
    Partial<Record<WebAddressField, string>>
  >({});
  const [breeds, setBreeds] = useState<FilterOption[]>([]);
  const [dogServices, setDogServices] = useState<FilterOption[]>([]);
  const [safetyFacilities, setSafetyFacilities] = useState<FilterOption[]>([]);
  const [amenities, setAmenities] = useState<FilterOption[]>([]);
  const [lastUpdatedDate, setLastUpdatedDate] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const skipNextPersistRef = useRef(false);
  const hasHydratedFromSourceRef = useRef(false);
  /** dirty draft를 setState보다 먼저 잠궈 source hydration 덮어쓰기 방지 */
  const hasRestoredDirtyDraftRef = useRef(false);
  /** ref가 아니라 state — draft sync 완료 후 source hydration effect가 다시 돌도록 */
  const [isDraftSyncDone, setIsDraftSyncDone] = useState(false);
  /** draft restore 시 persist effect가 반드시 돌도록 해 skip 플래그를 소비 */
  const [draftRestoreTick, setDraftRestoreTick] = useState(0);
  const isSaveLockedRef = useRef(false);
  const [isPreparingSave, setIsPreparingSave] = useState(false);

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
    function syncDraftFromStorage(options?: { ignoreVisibility?: boolean }) {
      // WebView는 최초 mount 시 visibilityState=hidden 인 경우가 있음.
      // 이때 early return 하면 draft sync 플래그가 영원히 false로 남아 프리필이 스킵됨.
      if (!options?.ignoreVisibility && document.visibilityState === 'hidden') return;

      const draft = loadEditFormDraft();

      if (draft?.isDirty && isMeaningfulEditDraft(draft)) {
        hasRestoredDirtyDraftRef.current = true;
        skipNextPersistRef.current = true;
        applyDraftToState(draft, draftSetters);
        // 동일 state면 persist effect가 스킵되어 skip 플래그가 남는 것 방지
        setDraftRestoreTick((tick) => tick + 1);
      } else if (draft?.isDirty) {
        // 빈 dirty draft(이전 레이스 잔재)는 source 프리필을 막지 않도록 제거
        clearEditFormDraft();
      }

      setIsDraftSyncDone(true);
    }

    syncDraftFromStorage({ ignoreVisibility: true });

    const handlePageShow = () => syncDraftFromStorage({ ignoreVisibility: true });
    const handleVisibilityChange = () => syncDraftFromStorage();

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener(EDIT_FORM_DRAFT_UPDATED_EVENT, handlePageShow);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener(EDIT_FORM_DRAFT_UPDATED_EVENT, handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount 시 draft 동기화만
  }, []);

  useEffect(() => {
    if (!isDraftSyncDone) return;
    if (hasHydratedFromSourceRef.current) return;

    if (hasRestoredDirtyDraftRef.current) {
      hasHydratedFromSourceRef.current = true;
      return;
    }

    if (isDirty) {
      hasHydratedFromSourceRef.current = true;
      return;
    }

    // Stack WebView는 매 진입마다 캐시가 비어 role/profile 로드 전 canUseAutofill=false로
    // 빈 폼을 확정하면 이후 데이터가 와도 프리필이 영구 스킵됨
    if (!isResolved || isProfileLoading) return;

    // profile 조회 실패 시 빈 소스로 hydration 확정하지 않음 (재시도 여지 유지)
    if (isProfileError) return;

    // MANUAL + 미저장: 프리필 소스 없음
    if (!canUseAutofill) {
      hasHydratedFromSourceRef.current = true;
      return;
    }

    if (!isAutofillPrefillReady) return;

    const next = mapToEditFormDraft({
      name: kindergartenName,
      address: kindergartenAddress,
      addressDetail: kindergartenAddressDetail,
      phone: formatPhone(phoneNumber),
      basic,
      bannerKeys,
      lastUpdatedDate: basic?.lastUpdatedAt?.trim() || null,
    });

    skipNextPersistRef.current = true;
    applyDraftToState(next, draftSetters);
    hasHydratedFromSourceRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 소스 데이터 1회 하이드레이션
  }, [
    isDraftSyncDone,
    isDirty,
    isResolved,
    isProfileLoading,
    isProfileError,
    canUseAutofill,
    isAutofillPrefillReady,
    kindergartenName,
    kindergartenAddress,
    kindergartenAddressDetail,
    phoneNumber,
    basic,
    bannerKeys,
  ]);

  useEffect(() => {
    if (!isDraftSyncDone) return;

    // restore tick으로 effect가 돌 때 hydration 전이어도 skip은 소비해야 함
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    if (!hasHydratedFromSourceRef.current) return;

    persistDraft(isDirty);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 폼 필드 변경 시에만 draft 저장
  }, [
    draftRestoreTick,
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
      sortDaysOfWeek(closedDays)
        .map((day) => CLOSED_DAYS[day as keyof typeof CLOSED_DAYS] ?? day)
        .join(', '),
    [closedDays]
  );

  const isOtherRequiredFieldsValid =
    images.length > 0 &&
    name.trim().length > 0 &&
    address.trim().length > 0 &&
    phone.trim().length > 0 &&
    isValidKindergartenPhone(phone) &&
    isValidWebAddressFormat(homepage) &&
    isValidWebAddressFormat(instagram) &&
    isValidWebAddressFormat(youtube);

  const weekdayOperatingHoursError = useMemo(() => {
    if (isDayOperatingHoursComplete(weekdayStart, weekdayEnd)) return undefined;
    if (!isOtherRequiredFieldsValid) return undefined;

    return WEEKDAY_OPERATING_HOURS_ERROR;
  }, [weekdayStart, weekdayEnd, isOtherRequiredFieldsValid]);

  const weekendOperatingHoursError = useMemo(() => {
    if (isDayOperatingHoursComplete(weekendStart, weekendEnd)) return undefined;
    if (!isOtherRequiredFieldsValid) return undefined;

    return WEEKEND_OPERATING_HOURS_ERROR;
  }, [weekendStart, weekendEnd, isOtherRequiredFieldsValid]);

  const isSaveEnabled =
    isOtherRequiredFieldsValid &&
    isOperatingHoursComplete(weekdayStart, weekdayEnd, weekendStart, weekendEnd);

  const handlePhoneBlur = () => {
    const trimmed = phone.trim();

    if (!trimmed) {
      setPhoneError(undefined);
      return;
    }

    setPhoneError(isValidKindergartenPhone(trimmed) ? undefined : PHONE_FORMAT_ERROR);
  };

  const clearWebAddressError = (field: WebAddressField) => {
    setWebAddressErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  /** 필드 이탈 시 http(s)·호스트 형식 검사. 오류 시 테두리+캡션 */
  const handleWebAddressBlur = (field: WebAddressField, value: string) => {
    const trimmed = value.trim();

    if (!trimmed || isValidWebAddressFormat(trimmed)) {
      clearWebAddressError(field);
      return;
    }

    setWebAddressErrors((prev) => ({
      ...prev,
      [field]: WEB_ADDRESS_FORMAT_ERROR,
    }));
  };

  /** 값이 유효해지면 즉시 인라인 오류 해제 */
  const handleWebAddressChange = (
    field: WebAddressField,
    setter: (value: string) => void,
    value: string
  ) => {
    updateField(setter, value);

    if (isValidWebAddressFormat(value)) {
      clearWebAddressError(field);
    }
  };

  const handleLeaveWithoutSaving = () => {
    clearEditFormDraft();
    back?.();
  };

  const leaveIfClean = () => {
    if (isDirty) return false;
    back?.();
    return true;
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

  return {
    isSelected,
    images,
    name,
    address,
    addressDetail,
    phone,
    phoneError,
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
    webAddressErrors,
    breeds,
    dogServices,
    safetyFacilities,
    amenities,
    lastUpdatedDate,
    isDirty,
    isSaveEnabled,
    weekdayOperatingHoursError,
    weekendOperatingHoursError,
    isSaving: isSaving || isPreparingSave,
    setActiveTimeField,
    setIsClosedDaysSheetOpen,
    closeTimeSheet: () => setActiveTimeField(null),
    closeClosedDaysSheet: () => setIsClosedDaysSheetOpen(false),
    handleImagesChange: (next: WebImageAsset[]) => updateField(setImages, next),
    handleNameChange: (value: string) => updateField(setName, formatName(value)),
    handleAddressDetailChange: (value: string) => updateField(setAddressDetail, value),
    handlePhoneChange: (value: string) => {
      setPhoneError(undefined);
      updateField(setPhone, formatPhone(value));
    },
    handlePhoneBlur,
    handleHomepageChange: (value: string) => {
      handleWebAddressChange('homepage', setHomepage, value);
    },
    handleInstagramChange: (value: string) => {
      handleWebAddressChange('instagram', setInstagram, value);
    },
    handleYoutubeChange: (value: string) => {
      handleWebAddressChange('youtube', setYoutube, value);
    },
    handleHomepageBlur: () => handleWebAddressBlur('homepage', homepage),
    handleInstagramBlur: () => handleWebAddressBlur('instagram', instagram),
    handleYoutubeBlur: () => handleWebAddressBlur('youtube', youtube),
    handleBreedsChange: (next: FilterOption[]) => updateField(setBreeds, next),
    handleDogServicesChange: (next: FilterOption[]) => updateField(setDogServices, next),
    handleSafetyFacilitiesChange: (next: FilterOption[]) =>
      updateField(setSafetyFacilities, next),
    handleAmenitiesChange: (next: FilterOption[]) => updateField(setAmenities, next),
    handleClosedDaysChange: (next: string[]) => updateField(setClosedDays, sortDaysOfWeek(next)),
    leaveIfClean,
    handleLeaveWithoutSaving,
    handleAddressSelect: (value: string) => {
      markDirty();
      setAddress(value);
      setAddressDetail('');
    },
    handleClearAddress: () => {
      markDirty();
      setAddress('');
      setAddressDetail('');
    },
    handleSave,
    handleTimeSelect,
  };
}

export { useKindergartenEditForm, type TimeFieldKey };
