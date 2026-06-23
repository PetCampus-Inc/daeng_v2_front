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

import { roleConversionProgress } from '@views/role-conversion/config/roleConversionProgress';
import type { KindergartenRegisterSource } from '@views/role-conversion/model/kindergartenInfo';

import { kindergartenRegisterContent } from '../config/kindergartenRegisterContent';
import { useKindergartenRegisterPage } from '../model/useKindergartenRegisterPage';

interface KindergartenRegisterPageProps {
  mode: KindergartenRegisterSource;
}

function KindergartenRegisterPage({ mode }: KindergartenRegisterPageProps) {
  const { form, isNextEnabled, handleFieldChange, handleNextClick } = useKindergartenRegisterPage(mode);

  return (
    <div className='flex h-full flex-col'>
      <Header>
        <Header.BackButton />
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
              <TextField>
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
              <TextField>
                <TextFieldInput
                  placeholder={kindergartenRegisterContent.addressPlaceholder}
                  value={form.address}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                />
              </TextField>
            </Field>

            <Field className='flex-col gap-2 py-4'>
              <FieldLabel className='body2-bold text-text-primary w-fit gap-px'>
                {kindergartenRegisterContent.numberLabel}
                <FieldLabelIndicator type='required' className='ml-0' />
              </FieldLabel>
              <TextField>
                <TextFieldInput
                  inputMode='tel'
                  placeholder={kindergartenRegisterContent.numberPlaceholder}
                  value={form.kindergartenNumber}
                  onChange={(e) => handleFieldChange('kindergartenNumber', e.target.value)}
                />
              </TextField>
            </Field>

            <Field className='flex-col gap-2 py-4'>
              <FieldLabel className='body2-bold text-text-primary w-fit gap-px'>
                {kindergartenRegisterContent.ownerNameLabel}
                <FieldLabelIndicator type='required' className='ml-0' />
              </FieldLabel>
              <TextField>
                <TextFieldInput
                  type='text'
                  placeholder={kindergartenRegisterContent.ownerNamePlaceholder}
                  value={form.ownerName}
                  onChange={(e) => handleFieldChange('ownerName', e.target.value)}
                />
              </TextField>
            </Field>

            <Field className='flex-col gap-2 py-4'>
              <FieldLabel className='body2-bold text-text-primary w-fit gap-px'>
                {kindergartenRegisterContent.phoneLabel}
                <FieldLabelIndicator type='required' className='ml-0' />
              </FieldLabel>
              <TextField>
                <TextFieldInput
                  inputMode='tel'
                  placeholder={kindergartenRegisterContent.phonePlaceholder}
                  value={form.phoneNumber}
                  onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                />
              </TextField>
            </Field>
          </div>
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
            {kindergartenRegisterContent.nextButtonLabel}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

export { KindergartenRegisterPage };
