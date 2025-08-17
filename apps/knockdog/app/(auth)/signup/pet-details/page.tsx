'use client';

import { useEffect, useState } from 'react';
import { ActionButton, ProgressBar, Icon, TextField, TextFieldInput, IconButton } from '@knockdog/ui';
import { useSearchParams, useRouter } from 'next/navigation';
import { useHeaderContext } from '@widgets/Header';
import {
  Step1Title,
  Step2Title,
  Step3Title,
  Step4Title,
  Step5Title,
  BreedSelector,
  YearSelector,
  GenderSelector,
  NeuteredSelector,
} from '@features/dog-profile';
import type { Breed } from '@features/dog-profile';

const MAX_STEP = 5;

const TITLE_COMPONENTS: Record<number, React.ComponentType<{ dogName: string }>> = {
  1: Step1Title,
  2: Step2Title,
  3: Step3Title,
  4: Step4Title,
  5: Step5Title,
};

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // searchParams가 null일 수 있으므로 안전하게 처리
  const dogName = searchParams?.get('dog-name') ?? '';
  const urlStep = searchParams?.get('step');

  const { setTitle } = useHeaderContext();

  // 각 단계별 상태 추가
  const [step, setStep] = useState(urlStep ? parseInt(urlStep) : 1);

  const [breed, setBreed] = useState<Breed | null>(null);
  const [birthYear, setBirthYear] = useState<string>('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | null>(null);
  const [isNeutered, setIsNeutered] = useState<boolean | null>(null);
  const [weight, setWeight] = useState<string>('');

  const StepTitle = TITLE_COMPONENTS[step];

  useEffect(() => {
    setTitle('프로필 등록');
  }, [setTitle]);

  // URL의 step 값이 변경될 때마다 상태 업데이트
  useEffect(() => {
    if (searchParams) {
      const urlStep = searchParams.get('step');
      if (urlStep) {
        const newStep = parseInt(urlStep);
        if (newStep >= 1 && newStep <= MAX_STEP && newStep !== step) {
          setStep(newStep);
        }
      } else if (step !== 1) {
        setStep(1);
      }
    }
  }, [searchParams, step]);

  // 각 단계별 버튼 활성화 조건
  const isStep1Valid = breed !== null;
  const isStep2Valid = birthYear !== '';
  const isStep3Valid = gender !== null;
  const isStep4Valid = isNeutered !== null;
  const isStep5Valid = weight !== '';

  const isDisabled = (() => {
    switch (step) {
      case 1:
        return !isStep1Valid;
      case 2:
        return !isStep2Valid;
      case 3:
        return !isStep3Valid;
      case 4:
        return !isStep4Valid;
      case 5:
        return !isStep5Valid;
      default:
        return true;
    }
  })();

  const updateStep = (newStep: number) => {
    if (searchParams) {
      const params = new URLSearchParams(searchParams);
      params.set('step', newStep.toString());
      router.push(`?${params.toString()}`);
      setStep(newStep);
    }
  };

  const handleNext = () => {
    if (step === 5) {
      router.push('/signup/complete');
      return;
    }

    if (step < MAX_STEP) {
      updateStep(step + 1);
    }
  };

  return (
    <div className='mt-[100px] px-4'>
      <ProgressBar totalSteps={MAX_STEP} value={step} className='py-2' />

      <div className='flex flex-col py-[26px]'>
        {StepTitle && <StepTitle dogName={dogName} />}

        <div className='flex flex-col gap-y-5'>
          {/* Step 5: 몸무게 */}
          {step >= 5 && (
            <div className='py-2'>
              <TextField
                label='몸무게 (kg)'
                suffix={
                  weight && (
                    <IconButton
                      icon='DeleteInput'
                      onClick={(e) => {
                        e.stopPropagation();
                        setWeight('');
                      }}
                    />
                  )
                }
              >
                <TextFieldInput
                  placeholder='소수점 한자리까지 입력 가능'
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </TextField>
            </div>
          )}

          {/* Step 4 이상: 중성화 여부 */}
          {step >= 4 && (
            <div className='py-2'>
              <NeuteredSelector value={isNeutered} onChange={setIsNeutered} />
            </div>
          )}

          {/* Step 3 이상: 성별 선택 */}
          {step >= 3 && (
            <div className='py-2'>
              <GenderSelector value={gender} onChange={setGender} />
            </div>
          )}

          {/* Step 2 이상: 생일 선택 */}
          {step >= 2 && (
            <div className='py-2'>
              <YearSelector birthYear={birthYear} setBirthYear={setBirthYear} />
            </div>
          )}
          {/* Step 1: 견종 선택 */}
          <div className='py-2'>
            <BreedSelector breed={breed} setBreed={setBreed} />
          </div>
        </div>
      </div>

      <div className='fixed bottom-0 left-0 right-0 flex gap-x-2 bg-white px-4 py-5'>
        <ActionButton variant='secondaryFill' className='w-full' disabled={isDisabled} onClick={handleNext}>
          <Icon icon='Plus' className='h-4 w-4' />
          {step === 5 ? '완료' : '다음'}
        </ActionButton>
      </div>
    </div>
  );
};

export default Page;
