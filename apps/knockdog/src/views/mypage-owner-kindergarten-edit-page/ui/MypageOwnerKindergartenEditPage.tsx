'use client';

import { useRef, useState, type ComponentProps, type ReactNode } from 'react';
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
import {
  AMENITY_OPTIONS,
  BREED_OPTIONS,
  CLOSED_DAY_OPTIONS,
  DOG_SERVICE_OPTIONS,
  SAFETY_OPTIONS,
  SECTION,
  SECTION_TABS,
  TIME_OPTIONS,
  type SectionId,
} from '@views/mypage-owner-kindergarten-edit-page/config/editFormOptions';
import { useKindergartenEditForm } from '@views/mypage-owner-kindergarten-edit-page/model/useKindergartenEditForm';

import { Header } from '@widgets/Header';

import { AddressPicker } from '@features/address-picker';
import { ownerMypageContent } from '@features/role-conversion';
import { FILTER_OPTIONS, type FilterOption } from '@entities/kindergarten';
import { OptionSelectSheet } from '@shared/ui/option-select-sheet';
import { PhotoUploader } from '@shared/ui/photo-uploader';
import { SafeArea } from '@shared/ui/safe-area';
import { toast } from '@shared/ui/toast';

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
  onBlur?: () => void;
  placeholder?: string;
  inputMode?: ComponentProps<'input'>['inputMode'];
  readOnly?: boolean;
  underlineValue?: boolean;
  spellCheck?: boolean;
  invalid?: boolean;
  errorMessage?: string;
}

/** 등록 플로우와 동일: h-x13 TextField + 값 있을 때 DeleteInput */
function ClearableTextField({
  label,
  required = false,
  indicator,
  value,
  onChange,
  onBlur,
  placeholder,
  inputMode,
  readOnly = false,
  underlineValue = false,
  spellCheck,
  invalid = false,
  errorMessage,
}: ClearableTextFieldProps) {
  return (
    <div className={errorMessage ? 'pb-4' : undefined}>
      <TextField
        label={label}
        required={required}
        indicator={indicator}
        invalid={invalid}
        className={`h-x13 ${
          underlineValue && value
            ? '[&_input]:underline [&_input]:decoration-[1px] [&_input]:underline-offset-2'
            : ''
        }`}
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
          onBlur={onBlur}
          placeholder={placeholder}
          inputMode={inputMode}
          readOnly={readOnly}
          spellCheck={spellCheck}
        />
      </TextField>
      {errorMessage ? <p className='text-error body2-regular pt-2'>{errorMessage}</p> : null}
    </div>
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<SectionId>(SECTION.BASIC);
  const formData = useKindergartenEditForm();

  const handleBack = () => {
    if (formData.leaveIfClean()) return;

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
            <AlertDialogAction onClick={formData.handleLeaveWithoutSaving}>
              {ownerMypageContent.unsavedExitModalConfirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  };

  const handleSave = async () => {
    if (!(await formData.handleSave())) return;

    toast({
      type: 'success',
      shape: 'rounded',
      position: 'bottom',
      nativeTitle: ownerMypageContent.kindergartenEditSaveSuccessToastFallback,
      titleParts: [
        { text: ownerMypageContent.kindergartenEditSaveSuccessToastPrefix, accent: true },
        { text: ownerMypageContent.kindergartenEditSaveSuccessToastSuffix },
      ],
      title: (
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
    <SafeArea edges={['bottom']} className='flex h-dvh flex-col'>
      <Header>
        <Header.LeftSection className='relative z-10'>
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
              key={
                formData.images.map((image) => image.key ?? image.uri).join('|') || 'images-empty'
              }
              maxCount={5}
              emptyVariant='tile'
              showRepresentativeBadge
              representativeBadgeLabel={ownerMypageContent.kindergartenEditRepresentativeBadge}
              defaultValue={formData.images}
              onChange={formData.handleImagesChange}
            />
          </div>

          <div className='px-4 py-2'>
            <ClearableTextField
              label={ownerMypageContent.kindergartenEditNameLabel}
              required
              value={formData.name}
              onChange={formData.handleNameChange}
              placeholder='유치원을 입력해주세요'
            />
          </div>

          <div className='flex flex-col gap-2 px-4 py-2'>
            <FieldLabel label={ownerMypageContent.kindergartenEditAddressLabel} required />
            <AddressPicker
              variant='embedded'
              showLabel={false}
              fieldVariant='default'
              clearOnReselect
              value={formData.address}
              placeholder={ownerMypageContent.kindergartenEditAddressSearchPlaceholder}
              onSelect={(selected) => {
                const nextAddress = selected.roadAddress || selected.address;
                if (nextAddress) formData.handleAddressSelect(nextAddress);
              }}
              onClear={formData.handleClearAddress}
            />
            <ClearableTextField
              value={formData.addressDetail}
              onChange={formData.handleAddressDetailChange}
              placeholder={ownerMypageContent.kindergartenEditAddressDetailPlaceholder}
            />
          </div>

          <div className='px-4 py-2'>
            <ClearableTextField
              label={ownerMypageContent.kindergartenEditPhoneLabel}
              required
              value={formData.phone}
              onChange={formData.handlePhoneChange}
              onBlur={formData.handlePhoneBlur}
              inputMode='tel'
              placeholder='전화번호를 입력해주세요'
              invalid={!!formData.phoneError}
              errorMessage={formData.phoneError}
            />
          </div>
        </section>

        <section id={`kindergarten-edit-${SECTION.HOURS}`}>
          <SectionTitle>{ownerMypageContent.kindergartenEditHoursSectionTitle}</SectionTitle>

          <div className='flex flex-col gap-2 px-4 py-4'>
            <FieldLabel label={ownerMypageContent.kindergartenEditWeekdayLabel} required />
            <div className='flex items-center gap-1'>
              <DropdownField
                value={formData.weekdayStart ?? undefined}
                placeholder={ownerMypageContent.kindergartenEditTimePlaceholder}
                className='flex-1'
                onClick={() => formData.setActiveTimeField('weekdayStart')}
              />
              <span className='body1-regular px-1'>~</span>
              <DropdownField
                value={formData.weekdayEnd ?? undefined}
                placeholder={ownerMypageContent.kindergartenEditTimePlaceholder}
                className='flex-1'
                onClick={() => formData.setActiveTimeField('weekdayEnd')}
              />
            </div>
          </div>

          <div className='flex flex-col gap-2 px-4 py-4'>
            <FieldLabel label={ownerMypageContent.kindergartenEditWeekendLabel} required />
            <div className='flex items-center gap-1'>
              <DropdownField
                value={formData.weekendStart ?? undefined}
                placeholder={ownerMypageContent.kindergartenEditTimePlaceholder}
                className='flex-1'
                onClick={() => formData.setActiveTimeField('weekendStart')}
              />
              <span className='body1-regular px-1'>~</span>
              <DropdownField
                value={formData.weekendEnd ?? undefined}
                placeholder={ownerMypageContent.kindergartenEditTimePlaceholder}
                className='flex-1'
                onClick={() => formData.setActiveTimeField('weekendEnd')}
              />
            </div>
          </div>

          <div className='flex flex-col gap-2 px-4 py-4'>
            <FieldLabel label={ownerMypageContent.kindergartenEditClosedDaysLabel} optional />
            <DropdownField
              value={formData.closedDaysLabel || undefined}
              placeholder={ownerMypageContent.kindergartenEditClosedDaysPlaceholder}
              onClick={() => formData.setIsClosedDaysSheetOpen(true)}
            />
          </div>
        </section>

        <section id={`kindergarten-edit-${SECTION.SNS}`}>
          <SectionTitle>{ownerMypageContent.kindergartenEditSnsSectionTitle}</SectionTitle>

          <div className='px-4 py-2'>
            <ClearableTextField
              label={ownerMypageContent.kindergartenEditHomepageLabel}
              indicator='(선택)'
              value={formData.homepage}
              onChange={formData.handleHomepageChange}
              onBlur={formData.handleHomepageBlur}
              placeholder='URL 주소를 입력해 주세요'
              underlineValue
              spellCheck={false}
              invalid={!!formData.webAddressErrors.homepage}
              errorMessage={formData.webAddressErrors.homepage}
            />
          </div>

          <div className='px-4 py-2'>
            <ClearableTextField
              label={ownerMypageContent.kindergartenEditInstagramLabel}
              indicator='(선택)'
              value={formData.instagram}
              onChange={formData.handleInstagramChange}
              onBlur={formData.handleInstagramBlur}
              placeholder='URL 주소를 입력해 주세요'
              underlineValue
              spellCheck={false}
              invalid={!!formData.webAddressErrors.instagram}
              errorMessage={formData.webAddressErrors.instagram}
            />
          </div>

          <div className='px-4 py-2'>
            <ClearableTextField
              label={ownerMypageContent.kindergartenEditYoutubeLabel}
              indicator='(선택)'
              value={formData.youtube}
              onChange={formData.handleYoutubeChange}
              onBlur={formData.handleYoutubeBlur}
              placeholder='URL 주소를 입력해 주세요'
              underlineValue
              spellCheck={false}
              invalid={!!formData.webAddressErrors.youtube}
              errorMessage={formData.webAddressErrors.youtube}
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
              selected={formData.breeds}
              onChange={formData.handleBreedsChange}
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
              selected={formData.dogServices}
              onChange={formData.handleDogServicesChange}
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
              selected={formData.safetyFacilities}
              onChange={formData.handleSafetyFacilitiesChange}
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
              selected={formData.amenities}
              onChange={formData.handleAmenitiesChange}
            />
          </div>
        </section>

        <div className='px-4 pt-5 pb-10'>
          <ActionButton
            type='button'
            size='large'
            variant='primaryFill'
            className='w-full'
            disabled={!formData.isSaveEnabled || formData.isSaving}
            onClick={handleSave}
          >
            {ownerMypageContent.profileSaveButtonLabel}
          </ActionButton>
        </div>
      </div>

      <OptionSelectSheet
        isOpen={formData.activeTimeField !== null}
        close={formData.closeTimeSheet}
        title={ownerMypageContent.kindergartenEditTimeSheetTitle}
        options={TIME_OPTIONS}
        value={formData.activeTimeValue}
        onSelect={formData.handleTimeSelect}
      />

      <OptionSelectSheet
        multiple
        isOpen={formData.isClosedDaysSheetOpen}
        close={formData.closeClosedDaysSheet}
        title={ownerMypageContent.kindergartenEditClosedDaysSheetTitle}
        description={ownerMypageContent.kindergartenEditMultiSelectHint}
        options={CLOSED_DAY_OPTIONS}
        values={formData.closedDays}
        onChange={formData.handleClosedDaysChange}
      />
    </SafeArea>
  );
}

export { MypageOwnerKindergartenEditPage };
