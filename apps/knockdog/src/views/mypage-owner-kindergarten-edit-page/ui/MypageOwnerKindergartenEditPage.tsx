'use client';

import { useEffect, useMemo, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import {
  ActionButton,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Icon,
  IconButton,
  TextField,
  TextFieldInput,
} from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { Header } from '@widgets/Header';

import { ownerMypageContent } from '@features/role-conversion';
import { CLOSED_DAYS } from '@entities/compare';
import { FILTER_CONFIG, FILTER_OPTIONS, type FilterOption } from '@entities/kindergarten';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { isNativeWebView } from '@shared/lib/device';
import type { WebImageAsset } from '@shared/lib/media';
import { OptionSelectSheet, type OptionItem } from '@shared/ui/option-select-sheet';
import { PhotoUploader } from '@shared/ui/photo-uploader';
import { SafeArea } from '@shared/ui/safe-area';
import { toast } from '@shared/ui/toast';

import {
  SELECTED_ADDRESS_EVENT,
  consumeSelectedAddress,
} from '../lib/selectedAddressDraft';

function formatDateYYYYMMDD(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

type TimeFieldKey = 'weekdayStart' | 'weekdayEnd' | 'weekendStart' | 'weekendEnd';

function createTimeOptions(stepMinutes = 30): OptionItem[] {
  const options: OptionItem[] = [];

  for (let minutes = 0; minutes < 24 * 60; minutes += stepMinutes) {
    const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
    const mins = String(minutes % 60).padStart(2, '0');
    const label = `${hours}:${mins}`;
    options.push({ value: label, label });
  }

  return options;
}

const TIME_OPTIONS = createTimeOptions();

const CLOSED_DAY_OPTIONS: OptionItem[] = Object.entries(CLOSED_DAYS).map(([value, label]) => ({
  value,
  label,
}));

const SECTION = {
  BASIC: 'basic',
  HOURS: 'hours',
  SNS: 'sns',
  DETAILS: 'details',
} as const;

type SectionId = (typeof SECTION)[keyof typeof SECTION];

const SECTION_TABS: { id: SectionId; label: string }[] = [
  { id: SECTION.BASIC, label: ownerMypageContent.kindergartenEditBasicSectionTitle },
  { id: SECTION.HOURS, label: ownerMypageContent.kindergartenEditHoursSectionTitle },
  { id: SECTION.SNS, label: ownerMypageContent.kindergartenEditSnsSectionTitle },
  { id: SECTION.DETAILS, label: ownerMypageContent.kindergartenEditDetailsSectionTitle },
];

const BREED_OPTIONS = FILTER_CONFIG['견종 조건'];
const DOG_SERVICE_OPTIONS = FILTER_CONFIG['강아지 서비스'];
const SAFETY_OPTIONS = FILTER_CONFIG['강아지 안전 ∙ 시설'];
const AMENITY_OPTIONS = FILTER_CONFIG['방문객 편의 ∙ 시설'];

/** 섹션 탭·복수선택 칩 공통 톤. size만 다름 (탭=38, 옵션=48) */
function selectionChipClassName(isSelected: boolean, size: 'tab' | 'option') {
  const sizeClass = size === 'tab' ? 'px-3.5 py-2.5' : 'h-12 px-4';
  const toneClass = isSelected
    ? 'bg-fill-secondary-700 text-text-primary-inverse'
    : 'bg-fill-secondary-50 text-text-secondary-inverse';

  return `radius-r2 body2-semibold shrink-0 whitespace-nowrap ${sizeClass} ${toneClass}`;
}

interface FieldLabelProps {
  label: string;
  required?: boolean;
  optional?: boolean;
}

function FieldLabel({ label, required = false, optional = false }: FieldLabelProps) {
  return (
    <div className='body2-bold flex items-center gap-px'>
      <span className='text-text-primary'>{label}</span>
      {required ? <span className='text-text-accent'>*</span> : null}
      {optional ? <span className='caption1-semibold text-text-tertiary'>(선택)</span> : null}
    </div>
  );
}

interface SectionTitleProps {
  children: ReactNode;
}

function SectionTitle({ children }: SectionTitleProps) {
  return <h2 className='h3-extrabold text-text-primary px-4 py-5'>{children}</h2>;
}

interface DropdownFieldProps {
  value?: string;
  placeholder: string;
  className?: string;
  onClick?: () => void;
}

function DropdownField({ value, placeholder, className, onClick }: DropdownFieldProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`radius-r2 border-line-200 bg-fill-secondary-0 flex h-[52px] items-center gap-2 border px-4 py-3 text-left ${className ?? 'w-full'}`}
    >
      <span
        className={`body1-regular flex-1 truncate ${value ? 'text-text-primary' : 'text-text-tertiary'}`}
      >
        {value || placeholder}
      </span>
      <Icon icon='ChevronBottom' className='text-text-tertiary size-5 shrink-0' />
    </button>
  );
}

interface ClearableTextFieldProps {
  label?: string;
  required?: boolean;
  indicator?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: ComponentProps<'input'>['inputMode'];
  readOnly?: boolean;
}

/** 등록 플로우와 동일: h-x13 TextField + 값 있을 때 DeleteInput */
function ClearableTextField({
  label,
  required = false,
  indicator,
  value,
  onChange,
  placeholder,
  inputMode,
  readOnly = false,
}: ClearableTextFieldProps) {
  return (
    <TextField
      label={label}
      required={required}
      indicator={indicator}
      className='h-x13'
      suffix={
        value ? (
          <IconButton
            type='button'
            icon='DeleteInput'
            onClick={() => onChange('')}
            aria-label='입력값 삭제'
          />
        ) : undefined
      }
    >
      <TextFieldInput
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        readOnly={readOnly}
      />
    </TextField>
  );
}

interface OptionChipGroupProps {
  options: readonly FilterOption[];
  selected: FilterOption[];
  onChange: (next: FilterOption[]) => void;
  /** 복수 선택 가능 여부. false면 단일 선택 */
  multiple?: boolean;
}

function OptionChipGroup({
  options,
  selected,
  onChange,
  multiple = true,
}: OptionChipGroupProps) {
  const handleToggle = (option: FilterOption) => {
    if (multiple) {
      onChange(
        selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option]
      );
      return;
    }

    onChange(selected.includes(option) ? [] : [option]);
  };

  return (
    <div className='flex flex-wrap gap-2'>
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type='button'
            aria-pressed={isSelected}
            onClick={() => handleToggle(option)}
            className={selectionChipClassName(isSelected, 'option')}
          >
            {FILTER_OPTIONS[option]}
          </button>
        );
      })}
    </div>
  );
}

function MypageOwnerKindergartenEditPage() {
  const { back, push } = useStackNavigation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<SectionId>(SECTION.BASIC);

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

  useEffect(() => {
    function syncSelectedAddress() {
      if (document.visibilityState === 'hidden') return;

      const selectedAddress = consumeSelectedAddress();
      if (selectedAddress) {
        setAddress(selectedAddress);
      }
    }

    syncSelectedAddress();

    window.addEventListener('pageshow', syncSelectedAddress);
    window.addEventListener(SELECTED_ADDRESS_EVENT, syncSelectedAddress);
    document.addEventListener('visibilitychange', syncSelectedAddress);

    return () => {
      window.removeEventListener('pageshow', syncSelectedAddress);
      window.removeEventListener(SELECTED_ADDRESS_EVENT, syncSelectedAddress);
      document.removeEventListener('visibilitychange', syncSelectedAddress);
    };
  }, []);

  const isDirty = useMemo(
    () =>
      images.length > 0 ||
      name.trim().length > 0 ||
      address.trim().length > 0 ||
      addressDetail.trim().length > 0 ||
      phone.trim().length > 0 ||
      Boolean(weekdayStart) ||
      Boolean(weekdayEnd) ||
      Boolean(weekendStart) ||
      Boolean(weekendEnd) ||
      closedDays.length > 0 ||
      homepage.trim().length > 0 ||
      instagram.trim().length > 0 ||
      youtube.trim().length > 0 ||
      breeds.length > 0 ||
      dogServices.length > 0 ||
      safetyFacilities.length > 0 ||
      amenities.length > 0,
    [
      images.length,
      name,
      address,
      addressDetail,
      phone,
      weekdayStart,
      weekdayEnd,
      weekendStart,
      weekendEnd,
      closedDays.length,
      homepage,
      instagram,
      youtube,
      breeds.length,
      dogServices.length,
      safetyFacilities.length,
      amenities.length,
    ]
  );

  const handleBack = () => {
    if (!isDirty) {
      back?.();
      return;
    }

    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{ownerMypageContent.unsavedExitModalTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {ownerMypageContent.unsavedExitModalDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{ownerMypageContent.unsavedExitModalCancelLabel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => back?.()}>
              {ownerMypageContent.unsavedExitModalConfirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  };

  const handleAddressSearch = async () => {
    await push({
      pathname: route.mypage.kindergarten.edit.address.root,
    });
  };

  const handleClearAddress = () => {
    setAddress('');
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

  const handleSave = () => {
    if (!isSaveEnabled) return;

    // TODO: 유치원 운영 정보 저장 API 연동
    setLastUpdatedDate(formatDateYYYYMMDD());
    toast({
      type: 'success',
      shape: 'rounded',
      position: 'bottom',
      title: isNativeWebView()
        ? ownerMypageContent.kindergartenEditSaveSuccessToastFallback
        : (
            <>
              <span className='body1-bold text-text-accent'>
                {ownerMypageContent.kindergartenEditSaveSuccessToastPrefix}
              </span>
              <span className='body1-medium text-text-primary-inverse'>
                {ownerMypageContent.kindergartenEditSaveSuccessToastSuffix}
              </span>
            </>
          ),
    });
  };

  const handleTimeSelect = (value: string) => {
    if (!activeTimeField) return;

    const setters: Record<TimeFieldKey, (next: string | null) => void> = {
      weekdayStart: setWeekdayStart,
      weekdayEnd: setWeekdayEnd,
      weekendStart: setWeekendStart,
      weekendEnd: setWeekendEnd,
    };
    setters[activeTimeField](value);
  };

  const handleScrollToSection = (sectionId: SectionId) => {
    setActiveSection(sectionId);

    const container = scrollRef.current;
    const target = document.getElementById(`kindergarten-edit-${sectionId}`);
    if (!container || !target) return;

    const tabsHeight = tabsRef.current?.offsetHeight ?? 0;
    const top = target.offsetTop - tabsHeight;

    container.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
  };

  return (
    <SafeArea edges={['bottom']} className='flex h-screen flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>{ownerMypageContent.kindergartenEditPageTitle}</Header.Title>
      </Header>

      <div ref={scrollRef} className='flex-1 overflow-y-auto'>
        <div
          ref={tabsRef}
          className='scrollbar-hide sticky top-0 z-10 flex gap-2 overflow-x-auto bg-white px-4 py-4'
        >
          {SECTION_TABS.map((tab) => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type='button'
                onClick={() => handleScrollToSection(tab.id)}
                className={selectionChipClassName(isActive, 'tab')}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <section id={`kindergarten-edit-${SECTION.BASIC}`}>
          <SectionTitle>{ownerMypageContent.kindergartenEditBasicSectionTitle}</SectionTitle>

          <div className='flex flex-col gap-2 px-4 pb-4'>
            <FieldLabel label={ownerMypageContent.kindergartenEditImageLabel} required />
            <PhotoUploader
              maxCount={5}
              emptyVariant='tile'
              showRepresentativeBadge
              representativeBadgeLabel={ownerMypageContent.kindergartenEditRepresentativeBadge}
              onChange={setImages}
            />
          </div>

          <div className='px-4 py-2'>
            <ClearableTextField
              label={ownerMypageContent.kindergartenEditNameLabel}
              required
              value={name}
              onChange={setName}
              placeholder='유치원을 입력해주세요'
            />
          </div>

          <div className='flex flex-col gap-2 px-4 py-2'>
            <FieldLabel label={ownerMypageContent.kindergartenEditAddressLabel} required />
            <button
              type='button'
              className='w-full text-left'
              onClick={handleAddressSearch}
              aria-label='주소 검색'
            >
              <TextField
                className='h-x13'
                prefix={<Icon icon='Search' className='text-text-tertiary' />}
                suffix={
                  address ? (
                    <IconButton
                      type='button'
                      icon='DeleteInput'
                      className='text-text-tertiary'
                      onClick={(event) => {
                        event.stopPropagation();
                        handleClearAddress();
                      }}
                      aria-label='선택한 주소 삭제'
                    />
                  ) : undefined
                }
              >
                <TextFieldInput
                  readOnly
                  tabIndex={-1}
                  placeholder={ownerMypageContent.kindergartenEditAddressSearchPlaceholder}
                  value={address}
                />
              </TextField>
            </button>
            <ClearableTextField
              value={addressDetail}
              onChange={setAddressDetail}
              placeholder={ownerMypageContent.kindergartenEditAddressDetailPlaceholder}
            />
          </div>

          <div className='px-4 py-2'>
            <ClearableTextField
              label={ownerMypageContent.kindergartenEditPhoneLabel}
              required
              value={phone}
              onChange={setPhone}
              inputMode='tel'
              placeholder='전화번호를 입력해주세요'
            />
          </div>
        </section>

        <section id={`kindergarten-edit-${SECTION.HOURS}`}>
          <SectionTitle>{ownerMypageContent.kindergartenEditHoursSectionTitle}</SectionTitle>

          <div className='flex flex-col gap-2 px-4 py-4'>
            <FieldLabel label={ownerMypageContent.kindergartenEditWeekdayLabel} required />
            <div className='flex items-center gap-1'>
              <DropdownField
                value={weekdayStart ?? undefined}
                placeholder={ownerMypageContent.kindergartenEditTimePlaceholder}
                className='flex-1'
                onClick={() => setActiveTimeField('weekdayStart')}
              />
              <span className='body1-regular px-1'>~</span>
              <DropdownField
                value={weekdayEnd ?? undefined}
                placeholder={ownerMypageContent.kindergartenEditTimePlaceholder}
                className='flex-1'
                onClick={() => setActiveTimeField('weekdayEnd')}
              />
            </div>
          </div>

          <div className='flex flex-col gap-2 px-4 py-4'>
            <FieldLabel label={ownerMypageContent.kindergartenEditWeekendLabel} required />
            <div className='flex items-center gap-1'>
              <DropdownField
                value={weekendStart ?? undefined}
                placeholder={ownerMypageContent.kindergartenEditTimePlaceholder}
                className='flex-1'
                onClick={() => setActiveTimeField('weekendStart')}
              />
              <span className='body1-regular px-1'>~</span>
              <DropdownField
                value={weekendEnd ?? undefined}
                placeholder={ownerMypageContent.kindergartenEditTimePlaceholder}
                className='flex-1'
                onClick={() => setActiveTimeField('weekendEnd')}
              />
            </div>
          </div>

          <div className='flex flex-col gap-2 px-4 py-4'>
            <FieldLabel label={ownerMypageContent.kindergartenEditClosedDaysLabel} optional />
            <DropdownField
              value={closedDaysLabel || undefined}
              placeholder={ownerMypageContent.kindergartenEditClosedDaysPlaceholder}
              onClick={() => setIsClosedDaysSheetOpen(true)}
            />
          </div>
        </section>

        <section id={`kindergarten-edit-${SECTION.SNS}`}>
          <SectionTitle>{ownerMypageContent.kindergartenEditSnsSectionTitle}</SectionTitle>

          <div className='px-4 py-2'>
            <ClearableTextField
              label={ownerMypageContent.kindergartenEditHomepageLabel}
              indicator='(선택)'
              value={homepage}
              onChange={setHomepage}
              placeholder='www.example.com'
            />
          </div>

          <div className='px-4 py-2'>
            <ClearableTextField
              label={ownerMypageContent.kindergartenEditInstagramLabel}
              indicator='(선택)'
              value={instagram}
              onChange={setInstagram}
              placeholder='@instagram'
            />
          </div>

          <div className='px-4 py-2'>
            <ClearableTextField
              label={ownerMypageContent.kindergartenEditYoutubeLabel}
              indicator='(선택)'
              value={youtube}
              onChange={setYoutube}
              placeholder='www.youtube.com/...'
            />
          </div>
        </section>

        <section id={`kindergarten-edit-${SECTION.DETAILS}`}>
          <div className='px-4 pt-5 pb-4'>
            <h3 className='h3-extrabold text-text-primary'>
              {ownerMypageContent.kindergartenEditBreedTitle}
            </h3>
          </div>
          <div className='px-4 pb-8'>
            <OptionChipGroup
              options={BREED_OPTIONS}
              selected={breeds}
              onChange={setBreeds}
              multiple={false}
            />
          </div>

          <div className='px-4 pt-5 pb-4'>
            <h3 className='h3-extrabold text-text-primary'>
              {ownerMypageContent.kindergartenEditDogServiceTitle}
            </h3>
            <p className='body2-regular text-text-tertiary mt-1'>
              {ownerMypageContent.kindergartenEditMultiSelectHint}
            </p>
          </div>
          <div className='px-4 pb-8'>
            <OptionChipGroup
              options={DOG_SERVICE_OPTIONS}
              selected={dogServices}
              onChange={setDogServices}
            />
          </div>

          <div className='px-4 pt-5 pb-4'>
            <h3 className='h3-extrabold text-text-primary'>
              {ownerMypageContent.kindergartenEditSafetyTitle}
            </h3>
            <p className='body2-regular text-text-tertiary mt-1'>
              {ownerMypageContent.kindergartenEditMultiSelectHint}
            </p>
          </div>
          <div className='px-4 pb-8'>
            <OptionChipGroup
              options={SAFETY_OPTIONS}
              selected={safetyFacilities}
              onChange={setSafetyFacilities}
            />
          </div>

          <div className='px-4 pt-5 pb-4'>
            <h3 className='h3-extrabold text-text-primary'>
              {ownerMypageContent.kindergartenEditAmenityTitle}
            </h3>
            <p className='body2-regular text-text-tertiary mt-1'>
              {ownerMypageContent.kindergartenEditMultiSelectHint}
            </p>
          </div>
          <div className='px-4 pb-8'>
            <OptionChipGroup
              options={AMENITY_OPTIONS}
              selected={amenities}
              onChange={setAmenities}
            />
          </div>

          <div className='flex flex-col px-4 py-4'>
            <span className='body1-bold text-text-primary'>
              {ownerMypageContent.kindergartenEditLastUpdatedTitle}
            </span>
            <span className='body2-regular text-text-tertiary'>
              {lastUpdatedDate ?? ownerMypageContent.noConfirmedInfoText}
            </span>
          </div>
        </section>

        <div className='px-4 pt-5 pb-10'>
          {/* TODO: 유치원 운영 정보 저장 API 연동 */}
          <ActionButton
            type='button'
            size='large'
            variant='primaryFill'
            className='w-full'
            disabled={!isSaveEnabled}
            onClick={handleSave}
          >
            {ownerMypageContent.profileSaveButtonLabel}
          </ActionButton>
        </div>
      </div>

      <OptionSelectSheet
        isOpen={activeTimeField !== null}
        close={() => setActiveTimeField(null)}
        title={ownerMypageContent.kindergartenEditTimeSheetTitle}
        options={TIME_OPTIONS}
        value={activeTimeValue}
        onSelect={handleTimeSelect}
      />

      <OptionSelectSheet
        multiple
        isOpen={isClosedDaysSheetOpen}
        close={() => setIsClosedDaysSheetOpen(false)}
        title={ownerMypageContent.kindergartenEditClosedDaysSheetTitle}
        description={ownerMypageContent.kindergartenEditMultiSelectHint}
        options={CLOSED_DAY_OPTIONS}
        values={closedDays}
        onChange={setClosedDays}
      />
    </SafeArea>
  );
}

export { MypageOwnerKindergartenEditPage };
