'use client';

import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';

import { formatName, formatPhone } from '../lib/formatKindergartenRegisterField';

import { saveOwnerProfile, type OwnerProfile } from './ownerProfile';

interface OwnerProfileFormData {
  name: string;
  phoneNumber: string;
  email: string;
}

interface UseOwnerProfileFormProps {
  defaultValues: OwnerProfile;
  onSuccess?: () => void;
}

function useOwnerProfileForm({ defaultValues, onSuccess }: UseOwnerProfileFormProps) {
  const { name, phoneNumber, email, profileImageUrl } = defaultValues;

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
  } = useForm<OwnerProfileFormData>({
    mode: 'onChange',
    defaultValues: { name, phoneNumber, email },
  });

  useEffect(() => {
    reset({ name, phoneNumber, email });
  }, [name, phoneNumber, email, reset]);

  const onSubmit: SubmitHandler<OwnerProfileFormData> = async (data) => {
    saveOwnerProfile({
      name: data.name.trim(),
      phoneNumber: data.phoneNumber.trim(),
      email: data.email.trim(),
      profileImageUrl,
    });
    onSuccess?.();
  };

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    isSubmitting,
    isValid,
    formatName,
    formatPhone,
  };
}

export { useOwnerProfileForm };
