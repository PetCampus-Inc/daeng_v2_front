'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';

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
  const memberId = params?.id ?? '';
  const copy = useClipboardCopy();
  const [activeTab, setActiveTab] = useState<OwnerMemberProfileTab>(TAB.GUARDIAN);

  // TODO: API 연동 시 useOwnerMemberQuery(memberId)로 교체
  const profile = getMockOwnerMemberProfile(memberId);

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
    profile,
    activeTab,
    setActiveTab,
    handleCopy,
  };
}

export { useOwnerMemberProfilePage };
