import { useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Breed } from '@features/dog-profile';
import { usePetUpdateDetailMutation } from '@entities/pet';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

import { petDetailFields } from './petDetailFields';

interface PetDetailForm {
  breed: Breed;
  birthYear: string;
  gender: 'MALE' | 'FEMALE';
  isNeutered: 'Y' | 'N';
  weight: string;
}

const usePetDetail = () => {
  const { push } = useStackNavigation();
  const { mutate: updatePetDetailMutate } = usePetUpdateDetailMutation();

  const [step, setStep] = useState(0);

  const searchParams = useSearchParams();
  const petName = searchParams.get('petName') as string;
  const petId = searchParams.get('petId') as string;

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const currentField = petDetailFields[step];
  const isLastStep = step === petDetailFields.length - 1;

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
      gender: watch.gender,
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
    push({ pathname: route.register.welcome.root });
  };

  return {
    step,
    petName,
    currentField,
    inputRefs,
    control,
    watch,
    isValid,
    handleSubmit,
    handleNext,
    handleSkip,
    handleFormSubmit,
    handleAnimationComplete,
  };
};

export { usePetDetail, type PetDetailForm };
