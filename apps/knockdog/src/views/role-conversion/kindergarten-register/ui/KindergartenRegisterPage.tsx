'use client';

import { useSearchParams } from 'next/navigation';

import {
  ActionButton,
  Field,
  FieldError,
  FieldLabel,
  FieldLabelIndicator,
  ProgressBar,
  TextField,
  TextFieldInput,
} from '@knockdog/ui';

import { AddressPicker } from '@features/address-picker';
import { REPRESENTATIVE_NAME_MAX_LENGTH, KINDERGARTEN_NAME_MAX_LENGTH } from '@features/role-conversion/lib/formatKindergartenRegisterField';

import { Header } from '@widgets/Header';

import { roleConversionProgress } from '@views/role-conversion/config/roleConversionProgress';
import type { KindergartenRegisterSource } from '@views/role-conversion/model/kindergartenInfo';

import { kindergartenRegisterContent } from '@views/role-conversion/kindergarten-register/config/kindergartenRegisterContent';
import { useKindergartenRegisterPage } from '@views/role-conversion/kindergarten-register/model/useKindergartenRegisterPage';

function RegisterPageContent({ mode }: { mode: KindergartenRegisterSource }) {
  const {
    form,
    fieldErrors,
    isNextEnabled,
    handleFieldChange,
    handlePhoneFieldBlur,
    handleAddressSelect,
    handleClearAddress,
    handleBack,
    handleNextClick,
  } = useKindergartenRegisterPage(mode);

  return (
    <div className='flex h-full flex-col'>
      <Header>
        <Header.BackButton onClick={handleBack} />
        <Header.Title>{kindergartenRegisterContent.headerTitle}</Header.Title>
      </Header>

      <div className='shrink-0 px-4 py-2'>
        <ProgressBar
          totalSteps={roleConversionProgress.totalSteps}
          value={roleConversionProgress.kindergartenSearchStep}
          className='h-1.5'
        />
      </div>

      <div className='flex min-h-0 flex-1 flex-col px-4 pt-3 pb-5'>
        {/* 다음 버튼을 스크롤 안에 둠 — iOS에서 footer가 키보드에 붙어 올라오지 않게 */}
        <div className='scrollbar-hide min-h-0 flex-1 overflow-y-auto'>
          <div className='flex flex-col gap-5'>
            <h1 className='h1-extrabold'>
              {kindergartenRegisterContent.titleLine1}
              <br />
              {kindergartenRegisterContent.titleLine2}
            </h1>

            <div className='flex flex-col'>
              <Field className='flex-col gap-2 py-4'>
                <FieldLabel className='body2-bold text-text-primary w-fit gap-px'>
                  {kindergartenRegisterContent.nameLabel}
                  <FieldLabelIndicator type='required' className='ml-0' />
                </FieldLabel>
                <TextField className='h-x13'>
                  <TextFieldInput
                    placeholder={kindergartenRegisterContent.namePlaceholder}
                    value={form.name}
                    maxLength={KINDERGARTEN_NAME_MAX_LENGTH}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                  />
                </TextField>
              </Field>

              <Field className='flex-col gap-2 py-4'>
                <FieldLabel className='body2-bold text-text-primary w-fit gap-px'>
                  {kindergartenRegisterContent.addressLabel}
                  <FieldLabelIndicator type='required' className='ml-0' />
                </FieldLabel>
                <div className='relative flex flex-col gap-2'>
                  <AddressPicker
                    variant='embedded'
                    showLabel={false}
                    fieldVariant='default'
                    clearOnReselect
                    value={form.address}
                    placeholder={kindergartenRegisterContent.addressSearchPlaceholder}
                    onSelect={handleAddressSelect}
                    onClear={handleClearAddress}
                  />
                  <TextField className='h-x13'>
                    <TextFieldInput
                      placeholder={kindergartenRegisterContent.addressDetailPlaceholder}
                      value={form.addressDetail ?? ''}
                      disabled={!form.address.trim()}
                      onChange={(e) => handleFieldChange('addressDetail', e.target.value)}
                    />
                  </TextField>
                </div>
              </Field>

              <Field className='flex-col gap-2 py-4' data-invalid={!!fieldErrors.kindergartenNumber || undefined}>
                <FieldLabel className='body2-bold text-text-primary w-fit gap-px'>
                  {kindergartenRegisterContent.numberLabel}
                  <FieldLabelIndicator type='required' className='ml-0' />
                </FieldLabel>
                <TextField className='h-x13' invalid={!!fieldErrors.kindergartenNumber}>
                  <TextFieldInput
                    inputMode='tel'
                    placeholder={kindergartenRegisterContent.numberPlaceholder}
                    value={form.kindergartenNumber}
                    onChange={(e) => handleFieldChange('kindergartenNumber', e.target.value)}
                    onBlur={() => handlePhoneFieldBlur('kindergartenNumber')}
                  />
                </TextField>
                <FieldError className='text-error body2-regular'>{fieldErrors.kindergartenNumber}</FieldError>
              </Field>

              <Field className='flex-col gap-2 py-4'>
                <FieldLabel className='body2-bold text-text-primary w-fit gap-px'>
                  {kindergartenRegisterContent.ownerNameLabel}
                  <FieldLabelIndicator type='required' className='ml-0' />
                </FieldLabel>
                <TextField className='h-x13'>
                  <TextFieldInput
                    type='text'
                    maxLength={REPRESENTATIVE_NAME_MAX_LENGTH}
                    placeholder={kindergartenRegisterContent.ownerNamePlaceholder}
                    value={form.ownerName}
                    onChange={(e) => handleFieldChange('ownerName', e.target.value)}
                  />
                </TextField>
              </Field>

              <Field className='flex-col gap-2 py-4' data-invalid={!!fieldErrors.phoneNumber || undefined}>
                <FieldLabel className='body2-bold text-text-primary w-fit gap-px'>
                  {kindergartenRegisterContent.phoneLabel}
                  <FieldLabelIndicator type='required' className='ml-0' />
                </FieldLabel>
                <TextField className='h-x13' invalid={!!fieldErrors.phoneNumber}>
                  <TextFieldInput
                    inputMode='tel'
                    placeholder={kindergartenRegisterContent.phonePlaceholder}
                    value={form.phoneNumber}
                    onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                    onBlur={() => handlePhoneFieldBlur('phoneNumber')}
                  />
                </TextField>
                <FieldError className='text-error body2-regular'>{fieldErrors.phoneNumber}</FieldError>
              </Field>
            </div>
          </div>

          <div className='py-5'>
            <ActionButton
              type='button'
              variant='secondaryFill'
              size='large'
              className='w-full'
              disabled={!isNextEnabled}
              onClick={handleNextClick}
            >
              {kindergartenRegisterContent.nextButtonLabel}
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function KindergartenRegisterPage() {
  const searchParams = useSearchParams();
  const rawMode = searchParams.get('mode');
  const mode: KindergartenRegisterSource = rawMode === 'search' ? 'search' : 'manual';
  const resetKey = searchParams.get('reset') ?? 'default';

  return <RegisterPageContent key={`${mode}-${resetKey}`} mode={mode} />;
}

export { KindergartenRegisterPage };
