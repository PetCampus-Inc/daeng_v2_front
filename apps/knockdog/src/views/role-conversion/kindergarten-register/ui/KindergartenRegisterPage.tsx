'use client';

import { useSearchParams } from 'next/navigation';

import {
  ActionButton,
  Field,
  FieldError,
  FieldLabel,
  FieldLabelIndicator,
  Icon,
  IconButton,
  ProgressBar,
  TextField,
  TextFieldInput,
} from '@knockdog/ui';

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
    isManualMode,
    handleFieldChange,
    handlePhoneFieldBlur,
    handleAddressSearch,
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
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                  />
                </TextField>
              </Field>

              <Field className='flex-col gap-2 py-4'>
                <FieldLabel className='body2-bold text-text-primary w-fit gap-px'>
                  {kindergartenRegisterContent.addressLabel}
                  <FieldLabelIndicator type='required' className='ml-0' />
                </FieldLabel>
                <div className='flex flex-col gap-2'>
                  {isManualMode ? (
                    <button
                      type='button'
                      className='w-full text-left'
                      onClick={handleAddressSearch}
                      aria-label='주소 검색'
                    >
                      <TextField
                        variant='secondary'
                        className='h-x13'
                        prefix={<Icon icon='Search' className='text-text-tertiary' />}
                        suffix={
                          form.address ? (
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
                          placeholder={kindergartenRegisterContent.addressSearchPlaceholder}
                          value={form.address}
                        />
                      </TextField>
                    </button>
                  ) : (
                    <TextField className='h-x13'>
                      <TextFieldInput
                        placeholder={kindergartenRegisterContent.addressPlaceholder}
                        value={form.address}
                        onChange={(e) => handleFieldChange('address', e.target.value)}
                      />
                    </TextField>
                  )}
                  <TextField className='h-x13'>
                    <TextFieldInput
                      placeholder={kindergartenRegisterContent.addressDetailPlaceholder}
                      value={form.addressDetail ?? ''}
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
        </div>

        <div className='shrink-0 py-5'>
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
