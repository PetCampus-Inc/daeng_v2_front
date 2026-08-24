'use client';

import {
  ActionButton,
  Field,
  FieldLabel,
  FieldLabelIndicator,
  IconButton,
  ProgressBar,
  TextField,
  TextFieldInput,
} from '@knockdog/ui';

import { Header } from '@widgets/Header';

import { roleConversionProgress } from '@views/role-conversion/config/roleConversionProgress';
import { businessVerificationContent } from '@views/role-conversion/business-verification/config/businessVerificationContent';
import { useBusinessVerificationPage } from '@views/role-conversion/business-verification/model/useBusinessVerificationPage';

function BusinessVerificationPage() {
  const { bizNo, isNextEnabled, handleInputChange, handleClear, handleNextClick } = useBusinessVerificationPage();

  const handleClearClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    handleClear();
  };

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

      <div className='flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-3 pb-5'>
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

            <TextField
              suffix={bizNo ? <IconButton icon='DeleteInput' onClick={handleClearClick} /> : undefined}
            >
              <TextFieldInput
                inputMode='numeric'
                maxLength={10}
                placeholder={businessVerificationContent.inputPlaceholder}
                value={bizNo}
                onChange={(e) => handleInputChange(e.target.value)}
              />
            </TextField>
          </Field>
        </div>

        {/* mt-auto 제거 — iOS 키보드에 다음 버튼이 붙지 않도록 문서 흐름에 둠 */}
        <div className='py-5'>
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
