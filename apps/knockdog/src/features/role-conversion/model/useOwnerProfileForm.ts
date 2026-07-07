'use client';

import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';

import { useUserStore } from '@entities/user';
import { useMoveImageMutation } from '@shared/lib/media';

import { formatName, formatPhone } from '../lib/formatKindergartenRegisterField';

import { saveOwnerProfile, type OwnerProfile } from './ownerProfile';

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
    reset({
      name,
      phoneNumber,
      email,
      profileImageUrl: profileImageUrl ?? '',
    });
  }, [name, phoneNumber, email, profileImageUrl, reset]);

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
      }
    }

    saveOwnerProfile({
      name: data.name.trim(),
      phoneNumber: data.phoneNumber.trim(),
      email: data.email.trim(),
      profileImageUrl: finalProfileImageUrl || undefined,
    });
    onSuccess?.();
  };

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    isSubmitting,
    isValid,
    isDirty,
    formatName,
    formatPhone,
  };
}

export { useOwnerProfileForm };
