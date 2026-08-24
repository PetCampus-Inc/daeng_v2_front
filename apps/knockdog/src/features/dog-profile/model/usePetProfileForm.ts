import { useForm, type SubmitHandler } from 'react-hook-form';
import type { Breed } from './breed.type';
import {
  usePetRegisterMutation,
  usePetUpdateDetailMutation,
  usePetUpdateRepresentativeMutation,
  usePetListQuery,
  type Gender,
  Pet,
  Relationship,
  RELATIONSHIP,
  RELATIONSHIP_LABEL,
} from '@entities/pet';
import { GUARDIAN_PET_CONNECTION_STATUSES_QUERY_KEY } from '@entities/guardian-invite';
import { useUserStore } from '@entities/user';
import { useMoveImageMutation } from '@shared/lib/media';
import { syncWebViewQuery } from '@shared/lib/sync-webview-query';
import { toast } from '@shared/ui/toast';
import { isValidDogWeight } from '../lib/weight';

export interface PetFormData {
  name: string;
  relationship: Relationship | '';
  relationshipText: string;
  breed?: Breed | null;
  birthYear?: string;
  weight?: number;
  gender: Gender | '';
  isNeutered: 'Y' | 'N' | '';
  profileImage?: string;
  /** 공통 이미지 피커가 반환한 원본 S3 key. 표시용 URL과 분리해 유지한다. */
  profileImageKey?: string;
}

interface UsePetProfileFormProps {
  mode: 'add' | 'edit';
  petId?: string;
  defaultValues?: Pet;
  onSuccess?: (petId?: string) => void;
  onError?: (error: unknown) => void;
}

export function usePetProfileForm({ mode, petId, defaultValues, onSuccess, onError }: UsePetProfileFormProps) {
  const { mutateAsync: registerPet } = usePetRegisterMutation();
  const { mutateAsync: updatePetDetail } = usePetUpdateDetailMutation();
  const { mutateAsync: updateRepresentative } = usePetUpdateRepresentativeMutation();
  const { mutateAsync: moveImage } = useMoveImageMutation();
  const { data: petListResponse, refetch: refetchPetList } = usePetListQuery();
  const user = useUserStore((state) => state.user);

  const transformDefaultValues = (pet?: Pet): PetFormData => {
    return {
      name: pet?.name || '',
      relationship: pet?.relationship ?? '',
      relationshipText: pet?.relationshipText || '',
      breed: pet?.breed ? { breedId: 0, breedName: pet.breed, alias: null } : null,
      birthYear: pet?.birthYear ? String(pet.birthYear) : undefined,
      weight: pet?.weight || undefined,
      gender: pet?.gender || '',
      isNeutered: pet?.isNeutered !== undefined ? (pet.isNeutered ? 'Y' : 'N') : '',
      profileImage: pet?.profileImage || '',
      profileImageKey: undefined,
    };
  };

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    trigger,
    reset,
    formState: { isValid, isDirty, isSubmitting },
  } = useForm<PetFormData>({
    mode: 'onChange',
    defaultValues: transformDefaultValues(defaultValues),
  });

  const onSubmit: SubmitHandler<PetFormData> = async (data) => {
    try {
      if (!data.relationship || (data.relationship === RELATIONSHIP.ETC && !data.relationshipText)) {
        throw new Error('관계는 필수입니다');
      }

      // DB에는 만료되는 presigned URL이 아닌 영구 S3 URL을 저장한다.
      let finalProfileImage = data.profileImage || '';
      if (data.profileImageKey && !user?.userId) {
        const error = new Error('이미지 저장을 위한 사용자 정보가 없습니다');
        onError?.(error);
        return;
      }

      if (data.profileImageKey) {
        try {
          const moveResponse = await moveImage({
            key: data.profileImageKey,
            path: `user/${user!.userId}`,
          });

          if (!moveResponse.data) {
            throw new Error('이미지 이동 결과를 받지 못했습니다');
          }

          // 이동 API는 영구 이미지 URL을 반환한다. 다음 저장 재시도에서 이미 삭제된 temp key를
          // 다시 이동하지 않도록 성공 결과를 폼에도 반영한다.
          finalProfileImage = moveResponse.data;
          setValue('profileImage', finalProfileImage, { shouldDirty: true });
          setValue('profileImageKey', undefined, { shouldDirty: true });
        } catch (error) {
          console.error('[pet/image/move] failed', {
            key: data.profileImageKey,
            path: `user/${user!.userId}`,
            error,
          });
          // 임시 이미지 URL로 펫을 등록하면 재시도할 때 원인을 더 흐리므로 중단한다.
          onError?.(error);
          return;
        }
      }

      const relationshipValue =
        data.relationship === RELATIONSHIP.ETC ? data.relationshipText : RELATIONSHIP_LABEL[data.relationship];

      if (
        !data.breed?.breedName ||
        !data.gender ||
        typeof data.weight !== 'number' ||
        !isValidDogWeight(data.weight)
      ) {
        throw new Error('견종, 몸무게, 성별은 필수 입력값입니다');
      }

      let newPetId: string | undefined;

      if (mode === 'add') {
        const registerRequest = {
          name: data.name,
          relationship: data.relationship,
          relationshipText: relationshipValue,
          profileImage: finalProfileImage,
          breed: data.breed.breedName,
          gender: data.gender,
          weight: data.weight,
          birthYear: data.birthYear ? Number(data.birthYear) : undefined,
          isNeutered: data.isNeutered === 'Y' ? true : data.isNeutered === 'N' ? false : undefined,
        };

        // petListResponse는 이 화면 진입 시점의 캐시라 로딩 중이면 0마리로 잘못 판단할 수 있으므로,
        // 대표견 여부를 결정하기 직전에 최신 목록을 다시 조회한다.
        const { data: freshPetListResponse } = await refetchPetList();
        const isFirstPet = ((freshPetListResponse ?? petListResponse)?.data?.length ?? 0) === 0;
        const registerResponse = await registerPet(registerRequest);
        newPetId = registerResponse.data?.id;

        // 첫 번째 강아지면 자동으로 대표 강아지로 지정한다.
        if (isFirstPet && newPetId) {
          try {
            await updateRepresentative(Number(newPetId));
          } catch (error) {
            console.error('대표 강아지 자동 지정 실패:', error);
            // 강아지 등록 자체는 성공했으므로 onError로 전체 실패 처리하지 않고 별도로 안내한다.
            toast({
              title: '대표 강아지 지정에 실패했어요. 마이페이지에서 다시 설정해 주세요',
              nativeTitle: '대표 강아지 지정에 실패했어요. 마이페이지에서 다시 설정해 주세요',
            });
          }
        }
      } else {
        // 수정 모드: 상세 정보만 업데이트
        if (!petId) throw new Error('petId is required in edit mode');

        newPetId = petId;

        await updatePetDetail({
          petId,
          name: data.name,
          relationship: data.relationship,
          relationshipText: relationshipValue,
          profileImage: finalProfileImage,
          breed: data.breed?.breedName,
          birthYear: Number(data.birthYear || '0'),
          gender: data.gender || undefined,
          isNeutered: data.isNeutered === 'Y' ? true : data.isNeutered === 'N' ? false : undefined,
          weight: data.weight,
        });
      }

      syncWebViewQuery.refetch(['petList']);
      // 강아지 선택 화면(보호자 초대)은 pet/list가 아닌 별도 연결 상태 query를 쓰므로 같이 갱신
      syncWebViewQuery.refetch([GUARDIAN_PET_CONNECTION_STATUSES_QUERY_KEY]);

      onSuccess?.(newPetId);
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
    setValue,
    trigger,
    reset,
    transformDefaultValues,
    isValid,
    isDirty,
    isSubmitting,
  };
}
