'use client';

import { cloneElement, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { ActionButton, ProgressBar } from '@knockdog/ui';
import { Header } from '@widgets/Header';
import {
  Breed,
  BreedSelector,
  GenderSelector,
  NeuteredSelector,
  WeightTextField,
  YearSelector,
} from '@features/dog-profile';
import { useStackNavigation } from '@shared/lib/bridge';
import { useSearchParams } from 'next/navigation';
import { Gender, Relationship } from '@entities/pet';
import { usePetUpdateDetailMutation } from '@entities/pet/api/usePetMutation';

interface PetDetailForm {
  breed: Breed;
  birthYear: string;
  gender: 'MALE' | 'FEMALE';
  isNeutered: 'Y' | 'N';
  weight: string;
}

const fields = [
  {
    index: 0,
    name: 'breed',
    label: '견종',
    prefix: '을',
    rules: { required: true },
    component: <BreedSelector />,
  },
  {
    index: 1,
    name: 'birthYear',
    label: '생일',
    prefix: '을',
    rules: { required: true },
    component: <YearSelector />,
  },
  {
    index: 2,
    name: 'gender',
    label: '성별',
    prefix: '을',
    rules: { required: true },
    component: <GenderSelector />,
  },
  {
    index: 3,
    name: 'isNeutered',
    label: '중성화 여부',
    prefix: '를',
    rules: { required: true },
    component: <NeuteredSelector />,
  },
  {
    index: 4,
    name: 'weight',
    label: '몸무게',
    prefix: '를',
    rules: { required: true },
    component: <WeightTextField />,
  },
];

function PetDetailPage() {
  const { push } = useStackNavigation();
  const { mutate: updatePetDetailMutate } = usePetUpdateDetailMutation();

  const [step, setStep] = useState(0);

  const searchParams = useSearchParams();
  const petName = searchParams.get('petName') as string;
  const relation = searchParams.get('relation') as Relationship;
  const petId = searchParams.get('petId') as string;

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const currentField = fields[step];
  const isLastStep = step === fields.length - 1;

  const {
    control,
    handleSubmit: submit,
    formState: { isValid },
    trigger,
  } = useForm<PetDetailForm>();

  const watch = useWatch<PetDetailForm>({ control });

  /** 폼 제출 핸들러 */
  const handleSubmit = async () => {
    await updatePetDetail();

    push({ pathname: '/register/welcome' });
  };

  /** 다음 단계로 이동 핸들러 */
  const handleNext = async () => {
    if (isLastStep) submit(handleSubmit)();
    else {
      const isFormValid = await trigger();

      if (isFormValid) {
        await updatePetDetail();
        setStep((prevStep) => prevStep + 1);
      }
    }
  };

  const updatePetDetail = async () => {
    updatePetDetailMutate({
      petId,
      breed: watch.breed?.breedName,
      birthYear: parseInt(watch.birthYear || '0'),
      gender: watch.gender as Gender,
      isNeutered: watch.isNeutered && watch.isNeutered === 'Y' ? true : false,
      weight: watch.weight ? parseInt(watch.weight) : undefined,
    });
  };

  /** 기본 폼 제출 핸들러 (데이터 제출 방지) */
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => e.preventDefault();

  /** 애니메이션 종료 후 핸들러 */
  const handleAnimationComplete = () => inputRefs.current[step]?.focus();

  /** 건너뛰기 핸들러 */
  const handleSkip = () => {
    // Alert 다이얼로그 띄우기
    push({ pathname: '/register/welcome' });
  };

  return (
    <div className='flex h-full flex-col'>
      <Header>
        <Header.BackButton />
        <Header.Title>프로필 등록</Header.Title>
        <Header.RightSection>
          <button className='label-semibold text-text-primary px-2 py-1' onClick={handleSkip}>
            건너뛰기
          </button>
        </Header.RightSection>
      </Header>

      <div className='relative flex-1 overflow-hidden px-4 pt-12 pb-5'>
        <div className='flex h-full flex-col'>
          <ProgressBar totalSteps={fields.length} value={step + 1} className='absolute -top-10 left-0 w-full' />

          {/* 타이틀 */}
          <h1 className='h1-extrabold'>
            {petName}의 <span className='text-text-accent'>{currentField?.label}</span>
            {currentField?.prefix}
            <br />
            알려주세요
          </h1>

          {/* 필드 */}
          <div className='mb-5 flex-1 overflow-y-auto pt-10'>
            <AnimatePresence>
              <form id='pet-detail-form' className='flex flex-col gap-8 pb-5' onSubmit={handleFormSubmit}>
                {fields
                  .slice()
                  .reverse()
                  .map(({ index, name, component, rules }) => {
                    if (index > step) return null;

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        onAnimationComplete={handleAnimationComplete}
                      >
                        <Controller
                          key={name}
                          name={name as keyof PetDetailForm}
                          control={control}
                          rules={rules}
                          render={({ field }) => {
                            return cloneElement(component, {
                              ...field,
                              onComplete: handleNext,
                              ref: (el: HTMLInputElement | null) => (inputRefs.current[index] = el),
                            });
                          }}
                        />
                      </motion.div>
                    );
                  })}
              </form>
            </AnimatePresence>
          </div>

          {/* 완료 버튼 */}
          <ActionButton
            variant='secondaryFill'
            size='large'
            className='w-full'
            form='pet-detail-form'
            type='button'
            disabled={!isValid}
            onClick={handleNext}
          >
            완료
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

export { PetDetailPage };
