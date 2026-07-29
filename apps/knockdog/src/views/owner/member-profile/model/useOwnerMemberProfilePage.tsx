'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';

import { useOwnerPetGuardianQuery, useOwnerPetQuery } from '@entities/owner-pet';

import { useClipboardCopy } from '@shared/lib/device';
import { toast } from '@shared/ui/toast';

import {
  TAB,
  getMockOwnerMemberProfile,
  ownerMemberProfileContent,
  type OwnerMemberProfileTab,
} from '../config/ownerMemberProfileContent';

function useOwnerMemberProfilePage() {
  const params = useParams<{ id: string }>();
  const petId = params?.id ?? '';
  const copy = useClipboardCopy();
  const [activeTab, setActiveTab] = useState<OwnerMemberProfileTab>(TAB.DOG);

  const {
    data: dog,
    isLoading: isDogLoading,
    isError: isDogError,
  } = useOwnerPetQuery({ petId, enabled: Boolean(petId) });

  const {
    data: guardian,
    isLoading: isGuardianLoading,
    isError: isGuardianError,
  } = useOwnerPetGuardianQuery({
    petId,
    enabled: Boolean(petId) && (activeTab === TAB.GUARDIAN || Boolean(dog)),
  });

  // 등하원 탭은 추후 API 연동 — 당분간 mock 유지
  const mockProfile = getMockOwnerMemberProfile(petId);

  const handleCopy = async (label: string, value: string) => {
    if (!value) return;

    const isCopied = await copy(value);
    if (!isCopied) return;

    toast({
      type: 'success',
      shape: 'rounded',
      position: 'bottom',
      nativeTitle: `${label}${ownerMemberProfileContent.copyToastSuffix}`,
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
    attendanceRecords: mockProfile.attendanceRecords,
    activeTab,
    setActiveTab,
    handleCopy,
    isDogLoading,
    isDogError,
    isGuardianLoading,
    isGuardianError,
  };
}

export { useOwnerMemberProfilePage };
