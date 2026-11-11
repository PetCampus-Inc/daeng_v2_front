'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import {
  isPetUnavailableError,
  useOwnerPetGuardianQuery,
  useOwnerPetQuery,
} from '@entities/owner-pet';

import { useClipboardCopy } from '@shared/lib/device';
import { useTabNavigation } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';

import {
  PROFILE_TAB_QUERY_KEY,
  TAB,
  ownerMemberProfileContent,
  toOwnerMemberProfileTab,
  type OwnerMemberProfileTab,
} from '../config/ownerMemberProfileContent';

function useOwnerMemberProfilePage() {
  const params = useParams<{ id: string }>();
  const petId = params?.id ?? '';
  const hasValidPetId = /^\d+$/.test(petId.trim());
  const searchParams = useSearchParams();
  const copy = useClipboardCopy();
  const { navigateToTab } = useTabNavigation();
  const redirectedPetId = useRef<string | null>(null);
  const [activeTab, setActiveTab] = useState<OwnerMemberProfileTab>(() =>
    toOwnerMemberProfileTab(searchParams?.get(PROFILE_TAB_QUERY_KEY))
  );

  const {
    data: dog,
    isLoading: isDogLoading,
    isError: isDogError,
    isSuccess: isDogSuccess,
    error: dogError,
  } = useOwnerPetQuery({ petId, enabled: Boolean(petId) });
  const isDogAccessDenied =
    !hasValidPetId || isPetUnavailableError(dogError) || (isDogSuccess && !dog);

  useEffect(() => {
    if (!isDogAccessDenied || redirectedPetId.current === petId) return;

    redirectedPetId.current = petId;
    void navigateToTab('/owner/members', undefined, 'owner')
      .then(() => toast({ title: ownerMemberProfileContent.alreadyDisconnectedToast }))
      .catch(() => {
        redirectedPetId.current = null;
      });
  }, [isDogAccessDenied, navigateToTab, petId]);

  const {
    data: guardian,
    isLoading: isGuardianLoading,
    isError: isGuardianError,
  } = useOwnerPetGuardianQuery({
    petId,
    enabled: Boolean(petId) && !isDogAccessDenied && (activeTab === TAB.GUARDIAN || Boolean(dog)),
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
    isDogAccessDenied,
    isGuardianLoading,
    isGuardianError,
  };
}

export { useOwnerMemberProfilePage };
