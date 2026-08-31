'use client';

import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';

import {
  usePutOwnerProfileMutation,
  useUserStore,
} from '@entities/user';
import { useMoveImageMutation } from '@shared/lib/media';
import { toast } from '@shared/ui/toast';

import { formatPhone, formatRepresentativeName } from '../lib/formatKindergartenRegisterField';

import { clearOwnerProfile, type OwnerProfile } from './ownerProfile';

interface OwnerProfileFormData {
  name: string;
  phoneNumber: string;
  email: string;
  profileImageUrl: string;
}

interface UseOwnerProfileFormProps {
  defaultValues: OwnerProfile;
  onSuccess?: () => void;
}

function useOwnerProfileForm({ defaultValues, onSuccess }: UseOwnerProfileFormProps) {
  const { name, phoneNumber, email, profileImageUrl } = defaultValues;
  const user = useUserStore((state) => state.user);
  const { mutateAsync: moveImage } = useMoveImageMutation();
  const { mutateAsync: putOwnerProfile } = usePutOwnerProfileMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid, isDirty },
  } = useForm<OwnerProfileFormData>({
    mode: 'onChange',
    defaultValues: {
      name,
      phoneNumber,
      email,
      profileImageUrl: profileImageUrl ?? '',
    },
  });

  useEffect(() => {
    // API 응답이 늦게 도착해도 작성 중(dirty) 값은 덮어쓰지 않음
    if (isDirty) return;

    reset({
      name,
      phoneNumber,
      email,
      profileImageUrl: profileImageUrl ?? '',
    });
  }, [name, phoneNumber, email, profileImageUrl, reset, isDirty]);

  const onSubmit: SubmitHandler<OwnerProfileFormData> = async (data) => {
    let finalProfileImageUrl = data.profileImageUrl || '';

    if (finalProfileImageUrl && finalProfileImageUrl.includes('temp') && user?.userId) {
      try {
        const imageUrl = new URL(finalProfileImageUrl);
        const key = imageUrl.pathname.substring(1);

        const moveResponse = await moveImage({
          key,
          path: `user/${user.userId}`,
        });

        finalProfileImageUrl = moveResponse.data;
      } catch (error) {
        console.error('이미지 이동 실패:', error);
        toast({
          type: 'default',
          shape: 'rounded',
          position: 'bottom',
          title: '프로필 이미지 저장에 실패했어요',
          description: error instanceof Error ? error.message : undefined,
        });
        return;
      }
    }

    try {
      await putOwnerProfile({
        representativeName: data.name.trim(),
        representativePhoneNumber: data.phoneNumber.trim(),
        // 빈 문자열은 BE @URL(regexp) 검증에 걸려 저장이 실패한다. 이미지 없으면 null.
        profileImageUrl: finalProfileImageUrl || null,
      });

      // 수정 API 연동 전 로컬 편집값 잔존 시 제거
      clearOwnerProfile();
      onSuccess?.();
    } catch (error) {
      console.error('[owner profile save]', error);
      toast({
        type: 'default',
        shape: 'rounded',
        position: 'bottom',
        title: '프로필 저장에 실패했어요',
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    isSubmitting,
    isValid,
    isDirty,
    formatRepresentativeName,
    formatPhone,
  };
}

export { useOwnerProfileForm };
