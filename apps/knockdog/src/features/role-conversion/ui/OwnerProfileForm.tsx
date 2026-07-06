'use client';

import { Controller } from 'react-hook-form';
import { ActionButton, Avatar, AvatarFallback, AvatarImage, TextField, TextFieldInput } from '@knockdog/ui';

import { ownerMypageContent } from '../config/ownerMypageContent';
import { useOwnerProfileForm } from '../model/useOwnerProfileForm';
import type { OwnerProfile } from '../model/ownerProfile';

interface OwnerProfileFormProps {
  defaultValues: OwnerProfile;
  submitButtonText?: string;
  onSuccess?: () => void;
}

function OwnerProfileForm({
  defaultValues,
  submitButtonText = ownerMypageContent.profileSaveButtonLabel,
  onSuccess,
}: OwnerProfileFormProps) {
  const { control, handleSubmit, isSubmitting, isValid, formatName, formatPhone } = useOwnerProfileForm({
    defaultValues,
    onSuccess,
  });

  return (
    <div className='px-4'>
      <form
        id='owner-profile-form'
        onSubmit={handleSubmit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
          }
        }}
        noValidate
        className='flex flex-col gap-y-5'
      >
        <div className='scrollbar-hide relative h-[calc(100vh-200px)] overflow-y-auto'>
          <div className='flex justify-center px-4 py-7'>
            <Avatar className='size-[120px]'>
              {defaultValues.profileImageUrl ? (
                <AvatarImage
                  src={defaultValues.profileImageUrl}
                  alt={defaultValues.name}
                  className='object-cover'
                />
              ) : null}
              <AvatarFallback className='bg-fill-secondary-50' />
            </Avatar>
          </div>

          <div className='py-2'>
            <Controller
              name='name'
              control={control}
              rules={{ required: true, validate: (value) => value.trim().length > 0 }}
              render={({ field, fieldState: { error } }) => (
                <TextField label={ownerMypageContent.ownerNameLabel} required errorMessage={error?.message}>
                  <TextFieldInput
                    {...field}
                    placeholder={ownerMypageContent.ownerNamePlaceholder}
                    onChange={(event) => field.onChange(formatName(event.target.value))}
                  />
                </TextField>
              )}
            />
          </div>

          <div className='py-2'>
            <Controller
              name='phoneNumber'
              control={control}
              rules={{ required: true, validate: (value) => value.trim().length > 0 }}
              render={({ field, fieldState: { error } }) => (
                <TextField label={ownerMypageContent.ownerPhoneLabel} required errorMessage={error?.message}>
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

          <div className='py-2'>
            <Controller
              name='email'
              control={control}
              rules={{
                validate: (value) => {
                  const trimmed = value.trim();
                  return trimmed.length === 0 || /\S+@\S+\.\S+/.test(trimmed);
                },
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField label={ownerMypageContent.ownerEmailLabel} indicator='(선택)' errorMessage={error?.message}>
                  <TextFieldInput
                    {...field}
                    type='email'
                    placeholder={ownerMypageContent.ownerEmailPlaceholder}
                    onChange={(event) => field.onChange(event.target.value.trim())}
                  />
                </TextField>
              )}
            />
          </div>
        </div>

        <div className='absolute right-0 bottom-6 left-0 bg-white px-4'>
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
