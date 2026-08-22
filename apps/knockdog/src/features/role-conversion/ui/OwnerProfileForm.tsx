'use client';

import { useEffect, type ReactElement } from 'react';
import { Controller } from 'react-hook-form';
import { ActionButton, TextField, TextFieldInput } from '@knockdog/ui';

import { ownerMypageContent } from '../config/ownerMypageContent';
import {
  isValidEmail,
  isValidRepresentativePhone,
} from '../lib/formatKindergartenRegisterField';
import { useOwnerProfileForm } from '../model/useOwnerProfileForm';
import type { OwnerProfile } from '../model/ownerProfile';

interface OwnerProfileFormProps {
  defaultValues: OwnerProfile;
  submitButtonText?: string;
  onSuccess?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  renderProfileImage: (props: { value: string; onChange: (value: string) => void }) => ReactElement;
}
function OwnerProfileForm({
  defaultValues,
  submitButtonText = ownerMypageContent.profileSaveButtonLabel,
  onSuccess,
  onDirtyChange,
  renderProfileImage,
}: OwnerProfileFormProps) {
  const { control, handleSubmit, isSubmitting, isValid, isDirty, formatName, formatPhone } = useOwnerProfileForm({
    defaultValues,
    onSuccess,
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  return (
    <div className='min-h-0 flex-1 px-4'>
      <form
        id='owner-profile-form'
        onSubmit={handleSubmit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
          }
        }}
        noValidate
        className='flex h-full min-h-0 flex-col'
      >
        <div className='scrollbar-hide min-h-0 flex-1 overflow-y-auto'>
          <Controller
            name='profileImageUrl'
            control={control}
            render={({ field }) => renderProfileImage({ value: field.value, onChange: field.onChange })}
          />

          <div className='py-4'>
            <Controller
              name='name'
              control={control}
              rules={{ required: true, validate: (value) => value.trim().length > 0 }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  label={ownerMypageContent.ownerNameLabel}
                  required
                  invalid={!!error}
                  errorMessage={error?.message}
                >
                  <TextFieldInput
                    {...field}
                    placeholder={ownerMypageContent.ownerNamePlaceholder}
                    onChange={(event) => field.onChange(formatName(event.target.value))}
                  />
                </TextField>
              )}
            />
          </div>

          <div className='py-4'>
            <Controller
              name='phoneNumber'
              control={control}
              rules={{
                required: true,
                validate: (value) => {
                  const trimmed = value.trim();
                  if (!trimmed) return true;
                  return (
                    isValidRepresentativePhone(trimmed) || ownerMypageContent.ownerPhoneFormatError
                  );
                },
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  label={ownerMypageContent.ownerPhoneLabel}
                  required
                  invalid={!!error}
                  errorMessage={error?.message}
                >
                  <TextFieldInput
                    {...field}
                    inputMode='tel'
                    placeholder={ownerMypageContent.ownerPhonePlaceholder}
                    onChange={(event) => field.onChange(formatPhone(event.target.value))}
                  />
                </TextField>
              )}
            />
          </div>

          <div className='py-4'>
            <Controller
              name='email'
              control={control}
              rules={{
                validate: (value) => {
                  const trimmed = value.trim();
                  if (!trimmed) return true;
                  return isValidEmail(trimmed) || ownerMypageContent.ownerEmailFormatError;
                },
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  label={ownerMypageContent.ownerEmailLabel}
                  indicator='(선택)'
                  invalid={!!error}
                  errorMessage={error?.message}
                >
                  <TextFieldInput
                    {...field}
                    type='email'
                    placeholder={ownerMypageContent.ownerEmailPlaceholder}
                  />
                </TextField>
              )}
            />
          </div>
        </div>

        <div className='shrink-0 bg-white py-x5'>
          <ActionButton type='submit' disabled={!isValid || isSubmitting}>
            {submitButtonText}
          </ActionButton>
        </div>
      </form>
    </div>
  );
}

export { OwnerProfileForm };
export type { OwnerProfileFormProps };
