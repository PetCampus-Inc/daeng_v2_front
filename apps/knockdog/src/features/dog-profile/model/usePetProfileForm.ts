import { useForm, type SubmitHandler } from 'react-hook-form';
import { usePetRegisterMutation, usePetUpdateDetailMutation, type Gender, type Relationship } from '@entities/pet';
import { useMoveImageMutation } from '@shared/lib/media';
import { useUserStore } from '@entities/user';
import type { Breed } from './breed.type';
import type { Pet } from '@entities/pet';

interface PetFormData {
  name: string;
  relationship: Relationship | '';
  breed?: Breed | null;
  birthYear?: string;
  weight?: number;
  gender: Gender | '';
  isNeutered: 'Y' | 'N' | '';
  profileImageUrl?: string;
}

interface UsePetProfileFormProps {
  mode: 'add' | 'edit';
  petId?: string;
  defaultValues?: Pet;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function usePetProfileForm({ mode, petId, defaultValues, onSuccess, onError }: UsePetProfileFormProps) {
  const { mutateAsync: registerPet } = usePetRegisterMutation();
  const { mutateAsync: updatePetDetail } = usePetUpdateDetailMutation();
  const { mutateAsync: moveImage } = useMoveImageMutation();
  const user = useUserStore((state) => state.user);

  const {
    control,
    handleSubmit,
    getValues,
    trigger,
    formState: { isValid, isDirty, isSubmitting },
  } = useForm<PetFormData>({
    mode: 'onChange',
    defaultValues: {
      name: defaultValues?.name || '',
      relationship: defaultValues?.relationship || '',
      breed: defaultValues?.breed ? { breedId: 0, breedName: defaultValues.breed } : null,
      birthYear: defaultValues?.birthYear ? String(defaultValues.birthYear) : undefined,
      weight: defaultValues?.weight || undefined,
      gender: defaultValues?.gender || '',
      isNeutered: defaultValues?.isNeutered !== undefined ? (defaultValues.isNeutered ? 'Y' : 'N') : '',
      profileImageUrl: defaultValues?.profileImageUrl || '',
    },
  });

  const onSubmit: SubmitHandler<PetFormData> = async (data) => {
    try {
      if (!data.relationship) {
        throw new Error('관계는 필수입니다');
      }

      // 이미지가 temp 경로인 경우 user 경로로 이동
      let finalProfileImage = data.profileImageUrl || '';
      if (finalProfileImage && finalProfileImage.includes('temp') && user?.id) {
        try {
          // URL에서 key 추출 (pathname 부분)
          const imageUrl = new URL(finalProfileImage);
          const key = imageUrl.pathname.substring(1); // 맨 앞 '/' 제거

          // 이미지를 user 경로로 이동
          const moveResponse = await moveImage({
            key,
            path: `/user/${user.id}`,
          });

          // 이동된 이미지 URL 사용
          finalProfileImage = moveResponse.data;
        } catch (error) {
          console.error('이미지 이동 실패:', error);
          // 이미지 이동 실패해도 원본 URL로 진행
        }
      }

      if (mode === 'add') {
        // 추가 모드: 펫 등록

        const registerResponse = await registerPet({
          name: data.name,
          relationship: data.relationship,
          profileImage: finalProfileImage,
        });

        const newPetId = registerResponse.data.id;

        // 사용자가 추가 정보를 입력했다면 상세 정보 업데이트
        const hasAdditionalInfo = data.breed || data.birthYear || data.weight || data.gender || data.isNeutered;

        if (hasAdditionalInfo) {
          await updatePetDetail({
            petId: newPetId,
            breed: data.breed?.breedName,
            birthYear: data.birthYear ? Number(data.birthYear) : undefined,
            gender: data.gender || undefined,
            isNeutered: data.isNeutered === 'Y' ? true : data.isNeutered === 'N' ? false : undefined,
            weight: data.weight,
          });
        }
      } else {
        // 수정 모드: 상세 정보만 업데이트
        if (!petId) throw new Error('petId is required in edit mode');

        await updatePetDetail({
          petId,
          name: data.name,
          relationship: data.relationship,
          profileImageUrl: data.profileImageUrl,
          breed: data.breed?.breedName,
          birthYear: data.birthYear ? Number(data.birthYear) : undefined,
          gender: data.gender || undefined,
          isNeutered: data.isNeutered === 'Y' ? true : data.isNeutered === 'N' ? false : undefined,
          weight: data.weight,
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error('펫 프로필 저장 실패:', error);
      onError?.(error);
    }
  };

  const submit = (e?: React.BaseSyntheticEvent) => handleSubmit(onSubmit)(e);

  return {
    control,
    handleSubmit: submit,
    getValues,
    trigger,
    isValid,
    isDirty,
    isSubmitting,
  };
}
