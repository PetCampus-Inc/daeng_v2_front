'use client';

import React from 'react';
import { Controller } from 'react-hook-form';
import {
  TextField,
  TextFieldInput,
  ActionButton,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@knockdog/ui';
import { RelationshipSelector } from './RelationshipSelector';
import { BreedSelector } from './BreedSelector';
import { YearSelector } from './YearSelector';
import { GenderSelector } from './GenderSelector';
import { NeuteredSelector } from './NeuteredSelector';
import { ProfileImageUploader } from './ProfileImageUploader';
import { usePetProfileForm } from '../model/usePetProfileForm';
import { overlay } from 'overlay-kit';
import { type Pet } from '@entities/pet';

interface PetProfileFormProps {
  mode: 'add' | 'edit';
  petId?: string;
  defaultValues?: Pet;
  submitButtonText?: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onBeforeSubmit?: (submitFn: () => void) => void;
}

function PetProfileForm({
  mode,
  petId,
  defaultValues,
  submitButtonText = '저장하기',
  onSuccess,
  onError,
  onDirtyChange,
  onBeforeSubmit,
}: PetProfileFormProps) {
  const { control, handleSubmit, isValid, isSubmitting, isDirty, getValues, trigger } = usePetProfileForm({
    mode,
    petId,
    defaultValues,
    onSuccess,
    onError,
  });

  // isDirty 상태 변경을 부모에게 알림
  React.useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 필수 필드 검증
    const isNameValid = await trigger('name');
    const isRelationshipValid = await trigger('relationship');

    if (!isNameValid || !isRelationshipValid) {
      overlay.open(({ isOpen, close }) => (
        <AlertDialog open={isOpen} onOpenChange={close}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>필수 정보를 입력해주세요!</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild onClick={() => close()}>
                <ActionButton variant='secondaryFill' className='text-white' onClick={() => close()}>
                  확인
                </ActionButton>
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ));
      return;
    }

    // onBeforeSubmit이 있으면 먼저 실행 (다이얼로그 등)
    if (onBeforeSubmit) {
      onBeforeSubmit(() => handleSubmit(e));
    } else {
      handleSubmit(e);
    }
  };

  return (
    <>
      <Controller
        name='profileImageUrl'
        control={control}
        render={({ field }) => (
          <ProfileImageUploader profileImage={field.value} onImageSelect={(uri) => field.onChange(uri)} />
        )}
      />

      <div className='px-4'>
        <form id='pet-profile-form' onSubmit={handleFormSubmit} noValidate className='flex flex-col gap-y-5'>
          <div className='py-2'>
            <Controller
              name='name'
              control={control}
              rules={{
                required: '강아지 이름을 입력해 주세요',
                maxLength: { value: 8, message: '8자 이내로 입력해 주세요' },
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField label='강아지 이름' required errorMessage={error?.message}>
                  <TextFieldInput {...field} placeholder='8자 이내 한글' />
                </TextField>
              )}
            />
          </div>

          <div className='py-2'>
            <div className='body2-semibold mb-2'>
              강아지와 내 관계 <strong className='body2-bold text-text-accent'>*</strong>
            </div>
            <Controller
              name='relationship'
              control={control}
              rules={{ required: '관계를 선택해 주세요' }}
              render={({ field }) => (
                <RelationshipSelector
                  placeholder='관계를 선택해 주세요'
                  value={field.value || null}
                  onChange={(value) => field.onChange(value)}
                />
              )}
            />
          </div>

          <div className='py-2'>
            <Controller
              name='breed'
              control={control}
              render={({ field }) => (
                <BreedSelector value={field.value || null} onChange={(value) => field.onChange(value)} />
              )}
            />
          </div>

          <div className='py-2'>
            <Controller
              name='birthYear'
              control={control}
              render={({ field }) => (
                <YearSelector value={field.value || ''} onChange={(value) => field.onChange(value)} />
              )}
            />
          </div>

          <div className='py-2'>
            <Controller
              name='weight'
              control={control}
              render={({ field }) => (
                <TextField label='몸무게(kg)' indicator='(선택)'>
                  <TextFieldInput {...field} value={field.value || ''} placeholder='숫자만 입력' type='number' />
                </TextField>
              )}
            />
          </div>

          <div className='py-2'>
            <Controller
              name='gender'
              control={control}
              render={({ field }) => (
                <GenderSelector value={field.value || null} onChange={(value) => field.onChange(value)} />
              )}
            />
          </div>

          <div className='py-2'>
            <Controller
              name='isNeutered'
              control={control}
              render={({ field }) => (
                <NeuteredSelector value={field.value || null} onChange={(value) => field.onChange(value)} />
              )}
            />
          </div>

          <div className='py-5'>
            <ActionButton type='submit' disabled={isSubmitting}>
              {submitButtonText}
            </ActionButton>
          </div>
        </form>
      </div>
    </>
  );
}

export { PetProfileForm };
