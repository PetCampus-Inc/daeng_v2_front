'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';

import {
  isPetNotAuthorizedError,
  useOwnerPetGuardianQuery,
  useOwnerPetQuery,
} from '@entities/owner-pet';

import { useClipboardCopy } from '@shared/lib/device';
import { toast } from '@shared/ui/toast';

import {
  TAB,
  ownerMemberProfileContent,
  type OwnerMemberProfileTab,
} from '../config/ownerMemberProfileContent';

function useOwnerMemberProfilePage() {
  const params = useParams<{ id: string }>();
  const petId = params?.id ?? '';
  const copy = useClipboardCopy();
  const [activeTab, setActiveTab] = useState<OwnerMemberProfileTab>(TAB.USAGE);

  const {
    data: dog,
    isLoading: isDogLoading,
    isError: isDogError,
    error: dogError,
  } = useOwnerPetQuery({ petId, enabled: Boolean(petId) });

  const {
    data: guardian,
    isLoading: isGuardianLoading,
    isError: isGuardianError,
  } = useOwnerPetGuardianQuery({
    petId,
    enabled: Boolean(petId) && (activeTab === TAB.GUARDIAN || Boolean(dog)),
  });

  const handleCopy = async (label: string, value: string) => {
    if (!value) return;

    const isCopied = await copy(value);
    if (!isCopied) return;

    toast({
      type: 'success',
      shape: 'rounded',
      position: 'bottom',
      nativeTitle: `${label}${ownerMemberProfileContent.copyToastSuffix}`,
      titleParts: [
        { text: label, accent: true },
        { text: ownerMemberProfileContent.copyToastSuffix },
      ],
      title: (
        <>
          <span className='body1-bold text-text-accent'>{label}</span>
          <span className='body1-medium text-text-primary-inverse'>
            {ownerMemberProfileContent.copyToastSuffix}
          </span>
        </>
      ),
    });
  };

  return {
    petId,
    dog,
    guardian,
    activeTab,
    setActiveTab,
    handleCopy,
    isDogLoading,
    isDogError,
    /** 연결이 해제됐거나 이 유치원 소속이 아닌 원생이라 프로필에 접근할 수 없다 */
    isDogAccessDenied: isPetNotAuthorizedError(dogError),
    isGuardianLoading,
    isGuardianError,
  };
}

export { useOwnerMemberProfilePage };
