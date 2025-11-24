import { useForm } from 'react-hook-form';
import { usePetRegisterMutation, usePetUpdateDetailMutation, type Gender, type Relationship } from '@entities/pet';
import { useMoveImageMutation } from '@shared/lib/media';
import { useUserStore } from '@entities/user';
import type { Breed } from './breed.type';

export interface PetProfileFormData {
  name: string;
  relationship?: Relationship;
  breed?: Breed | null;
  birthYear?: string;
  weight?: string;
  gender?: Gender;
  isNeutered?: 'Y' | 'N';
  profileImage?: string;
}

interface UsePetProfileFormProps {
  mode: 'add' | 'edit';
  petId?: string;
  defaultValues?: Partial<PetProfileFormData>;
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
  } = useForm<PetProfileFormData>({
    mode: 'onChange',
    defaultValues: {
      name: defaultValues?.name || '',
      relationship: defaultValues?.relationship || ('' as any),
      breed: defaultValues?.breed || null,
      birthYear: defaultValues?.birthYear || '',
      weight: defaultValues?.weight || '',
      gender: defaultValues?.gender || ('' as any),
      isNeutered: defaultValues?.isNeutered || ('' as any),
      profileImage: defaultValues?.profileImage || '',
    },
  });

  const onSubmit = async (data: PetProfileFormData) => {
    try {
      if (mode === 'add') {
        // 추가 모드: 펫 등록
        if (!data.relationship) {
          throw new Error('관계는 필수입니다');
        }

        // 이미지가 temp 경로인 경우 user 경로로 이동
        let finalProfileImage = data.profileImage || '';
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
            birthYear: data.birthYear ? parseInt(data.birthYear) : undefined,
            gender: data.gender || undefined,
            isNeutered: data.isNeutered ? data.isNeutered === 'Y' : undefined,
            weight: data.weight ? parseInt(data.weight) : undefined,
          });
        }
      } else {
        // 수정 모드: 상세 정보만 업데이트
        if (!petId) throw new Error('petId is required in edit mode');

        await updatePetDetail({
          petId,
          breed: data.breed?.breedName,
          birthYear: data.birthYear ? parseInt(data.birthYear) : undefined,
          gender: data.gender,
          isNeutered: data.isNeutered ? data.isNeutered === 'Y' : undefined,
          weight: data.weight ? parseInt(data.weight) : undefined,
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error('펫 프로필 저장 실패:', error);
      onError?.(error);
    }
  };

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    getValues,
    trigger,
    isValid,
    isDirty,
    isSubmitting,
  };
}
