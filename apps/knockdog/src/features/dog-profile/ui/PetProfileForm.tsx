'use client';

import React from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { TextField, TextFieldInput, ActionButton } from '@knockdog/ui';
import { RelationshipSelector } from './RelationshipSelector';
import { BreedSelector } from './BreedSelector';
import { YearSelector } from './YearSelector';
import { GenderSelector } from './GenderSelector';
import { NeuteredSelector } from './NeuteredSelector';
import { ProfileImageUploader } from './ProfileImageUploader';
import {
  MAX_DOG_NAME_LENGTH,
  MAX_RELATIONSHIP_TEXT_LENGTH,
  normalizeDogName,
  normalizeRelationshipText,
} from '../lib/normalizeKoreanText';
import { MAX_DOG_WEIGHT, isValidDogWeight, normalizeDogWeight } from '../lib/weight';
import { usePetProfileForm } from '../model/usePetProfileForm';
import { cn } from '@knockdog/ui/lib';
import { RELATIONSHIP, type Pet } from '@entities/pet';

interface PetProfileFormProps {
  mode: 'add' | 'edit';
  petId?: string;
  defaultValues?: Pet;
  submitButtonText?: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onBeforeSubmit?: (submitFn: () => void, formData: { name: string }) => void;
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
  const { control, handleSubmit, isSubmitting, isValid, isDirty, getValues, reset, transformDefaultValues } =
    usePetProfileForm({
      mode,
      petId,
      defaultValues,
      onSuccess,
      onError,
    });

  const relationship = useWatch({ control, name: 'relationship' });
  const isAdditionalInfoRequired = mode === 'add';

  // defaultValues가 변경될 때 폼 리셋
  const defaultValuesKey = React.useMemo(() => {
    if (!defaultValues) return null;
    return JSON.stringify({
      id: defaultValues.id,
      name: defaultValues.name,
      relationship: defaultValues.relationship,
      relationshipText: defaultValues.relationshipText,
      breed: defaultValues.breed,
      birthYear: defaultValues.birthYear,
      weight: defaultValues.weight,
      gender: defaultValues.gender,
      isNeutered: defaultValues.isNeutered,
      profileImage: defaultValues.profileImage,
    });
  }, [defaultValues]);

  React.useEffect(() => {
    if (defaultValues && defaultValuesKey) {
      reset(transformDefaultValues(defaultValues));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValuesKey, reset]);

  // isDirty 상태 변경을 부모에게 알림
  React.useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isValid || isSubmitting) return;

    // onBeforeSubmit이 있으면 먼저 실행 (다이얼로그 등)
    if (onBeforeSubmit) {
      const formData = getValues();
      onBeforeSubmit(() => handleSubmit(e), { name: formData.name });
    } else {
      handleSubmit(e);
    }
  };

  return (
    <>
      <div className='h-[calc(100dvh-64px)] px-4'>
        <form
          id='pet-profile-form'
          onSubmit={handleFormSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          noValidate
          className='flex h-full min-h-0 flex-col'
        >
          <div className='scrollbar-hide min-h-0 flex-1 overflow-y-auto'>
            <Controller
              name='profileImage'
              control={control}
              render={({ field }) => (
                <ProfileImageUploader profileImage={field.value} onImageSelect={(uri) => field.onChange(uri)} />
              )}
            />
            <div className='py-4'>
              <Controller
              name='name'
              control={control}
              rules={{ required: '강아지 이름을 입력해 주세요' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField label='강아지 이름' required invalid={!!error} errorMessage={error?.message}>
                    <TextFieldInput
                      {...field}
                      maxLength={MAX_DOG_NAME_LENGTH}
                      placeholder='8글자 이내 한글로 입력해 주세요'
                      onChange={(e) => {
                        if ((e.nativeEvent as InputEvent).isComposing) {
                          field.onChange(e.target.value);
                          return;
                        }
                        field.onChange(normalizeDogName(e.target.value));
                      }}
                      onCompositionEnd={(e) => field.onChange(normalizeDogName(e.currentTarget.value))}
                    />
                  </TextField>
                )}
              />
            </div>

            <div className='py-4'>
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

            <div className={cn('py-4', relationship !== RELATIONSHIP.ETC && 'hidden')}>
              <Controller
                name='relationshipText'
                control={control}
                rules={relationship === RELATIONSHIP.ETC ? { required: '관계를 입력해 주세요' } : undefined}
                render={({ field, fieldState: { error } }) => (
                  <TextField label='관계(직접 입력)' required invalid={!!error} errorMessage={error?.message}>
                    <TextFieldInput
                      {...field}
                      maxLength={MAX_RELATIONSHIP_TEXT_LENGTH}
                      placeholder='5자 이내 한글로 입력해 주세요'
                      onChange={(e) => {
                        if ((e.nativeEvent as InputEvent).isComposing) {
                          field.onChange(e.target.value);
                          return;
                        }
                        field.onChange(normalizeRelationshipText(e.target.value));
                      }}
                      onCompositionEnd={(e) => field.onChange(normalizeRelationshipText(e.currentTarget.value))}
                    />
                  </TextField>
                )}
              />
            </div>

            <div className='py-4'>
              <Controller
                name='breed'
                control={control}
                rules={isAdditionalInfoRequired ? { required: '견종을 선택해 주세요' } : undefined}
                render={({ field, fieldState: { error } }) => (
                  <BreedSelector
                    value={field.value || null}
                    required={isAdditionalInfoRequired}
                    errorMessage={error?.message}
                    onChange={(value) => field.onChange(value)}
                  />
                )}
              />
            </div>

            <div className='py-4'>
              <Controller
                name='birthYear'
                control={control}
                render={({ field }) => (
                  <YearSelector value={field.value || ''} onChange={(value) => field.onChange(value)} />
                )}
              />
            </div>

            <div className='py-4'>
              <Controller
                name='weight'
                control={control}
                rules={
                  isAdditionalInfoRequired
                    ? {
                        required: '몸무게를 입력해 주세요',
                        validate: (value) => isValidDogWeight(value) || '몸무게는 1~99kg의 정수만 입력할 수 있어요',
                      }
                    : {
                        validate: (value) =>
                          value === undefined ||
                          isValidDogWeight(value) ||
                          '몸무게는 1~99kg의 정수만 입력할 수 있어요',
                      }
                }
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    label='몸무게(kg)'
                    required={isAdditionalInfoRequired}
                    indicator={isAdditionalInfoRequired ? undefined : '(선택)'}
                    invalid={!!error}
                    errorMessage={error?.message}
                  >
                    <TextFieldInput
                      {...field}
                      value={field.value ?? ''}
                      maxLength={String(MAX_DOG_WEIGHT).length}
                      inputMode='numeric'
                      pattern='[0-9]*'
                      onChange={(event) => {
                        const value = normalizeDogWeight(event.target.value);
                        field.onChange(value === '' ? undefined : Number(value));
                      }}
                    />
                  </TextField>
                )}
              />
            </div>

            <div className='py-4'>
              <Controller
                name='gender'
                control={control}
                rules={isAdditionalInfoRequired ? { required: '성별을 선택해 주세요' } : undefined}
                render={({ field }) => (
                  <GenderSelector
                    value={field.value || null}
                    required={isAdditionalInfoRequired}
                    onChange={(value) => field.onChange(value)}
                  />
                )}
              />
            </div>

            <div className='py-4'>
              <Controller
                name='isNeutered'
                control={control}
                render={({ field }) => (
                  <NeuteredSelector value={field.value || null} onChange={(value) => field.onChange(value)} />
                )}
              />
            </div>
          </div>

          <div className='shrink-0 bg-bg-0 py-x5'>
            <ActionButton type='submit' size='large' disabled={!isValid || isSubmitting}>
              {submitButtonText}
            </ActionButton>
          </div>
        </form>
      </div>
    </>
  );
}

export { PetProfileForm };
