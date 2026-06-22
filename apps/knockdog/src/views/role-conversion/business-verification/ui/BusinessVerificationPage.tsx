'use client';

import {
  ActionButton,
  Field,
  FieldLabel,
  FieldLabelIndicator,
  ProgressBar,
  TextField,
  TextFieldInput,
} from '@knockdog/ui';

import { Header } from '@widgets/Header';

import { businessVerificationContent } from '../config/businessVerificationContent';
import { roleConversionProgress } from '@views/role-conversion/config/roleConversionProgress';
import { useBusinessVerificationPage } from '../model/useBusinessVerificationPage';

function BusinessVerificationPage() {
  const {
    bizNo,
    error,
    isVerified,
    isVerifyEnabled,
    isNextEnabled,
    isVerifyPending,
    handleInputChange,
    handleVerifyClick,
    handleNextClick,
  } = useBusinessVerificationPage();

  const showHintLabel = !isVerifyPending && !isVerified && !error;

  return (
    <div className='flex h-full flex-col'>
      <Header>
        <Header.BackButton />
        <Header.Title>{businessVerificationContent.headerTitle}</Header.Title>
      </Header>

      <div className='shrink-0 px-4 py-2'>
        <ProgressBar
          totalSteps={roleConversionProgress.totalSteps}
          value={roleConversionProgress.businessVerificationStep}
        />
      </div>

      <div className='flex flex-1 flex-col px-4 pt-3 pb-5'>
        <div className='flex flex-col gap-5'>
          <h1 className='h1-extrabold'>
            {businessVerificationContent.titleLine1}
            <br />
            {businessVerificationContent.titleLine2}
          </h1>

          <Field className='flex-col gap-2 py-2'>
            <FieldLabel className='body2-bold text-text-primary w-fit gap-px'>
              {businessVerificationContent.fieldLabel}
              <FieldLabelIndicator type='required' className='ml-0' />
            </FieldLabel>

            <div className='flex items-start gap-2'>
              <div className='min-w-0 flex-1'>
                <TextField
                  invalid={!!error}
                  valid={isVerified}
                  errorMessage={error ?? undefined}
                  successMessage={isVerified ? businessVerificationContent.successMessage : undefined}
                >
                  <TextFieldInput
                    inputMode='numeric'
                    maxLength={10}
                    placeholder={businessVerificationContent.inputPlaceholder}
                    value={bizNo}
                    onChange={(e) => handleInputChange(e.target.value)}
                  />
                </TextField>
                {showHintLabel && (
                  <span className='body2-regular text-text-tertiary mt-2 block'>
                    {businessVerificationContent.hintLabel}
                  </span>
                )}
              </div>

              <ActionButton
                type='button'
                className='max-w-20 shrink-0'
                variant='secondaryFill'
                disabled={!isVerifyEnabled}
                onClick={handleVerifyClick}
              >
                {businessVerificationContent.verifyButtonLabel}
              </ActionButton>
            </div>
          </Field>
        </div>

        <div className='mt-auto py-5'>
          <ActionButton
            type='button'
            variant='secondaryFill'
            size='large'
            className='w-full'
            disabled={!isNextEnabled}
            onClick={handleNextClick}
          >
            {businessVerificationContent.nextButtonLabel}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

export { BusinessVerificationPage };
