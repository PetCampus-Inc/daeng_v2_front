'use client';

import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { ActionButton, Checkbox, ProgressBar, ScrollBar } from '@knockdog/ui';

import { Header } from '@widgets/Header';
import { GUARDIAN_HOME_QUERY_KEY } from '@entities/guardian-home';
import {
  guardianPetConnectionStatusesQueryKey,
  postGuardianApplication,
  type GuardianPetConnection,
} from '@entities/guardian-invite';
import { PET_LIST_QUERY_KEY } from '@entities/pet';
import { ApiError } from '@shared/api';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { SafeArea } from '@shared/ui/safe-area';

import {
  privacyConsentPolicyClosing,
  privacyConsentPolicyIntro,
  privacyConsentPolicySections,
} from '../config/privacyConsentPolicyBody';

type SelectedGuardianPet = Pick<GuardianPetConnection, 'petId' | 'name'>;

/** 보호자 초대 3단계: 개인정보 수집 및 이용 동의 */
function GuardianInvitePrivacyConsentPage() {
  const { token } = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  const { getParams, replace } = useStackNavigation();
  const queryClient = useQueryClient();
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPets] = useState<SelectedGuardianPet[]>(
    () => getParams<{ selectedPets?: SelectedGuardianPet[] }>()?.selectedPets ?? []
  );
  // 스택 params는 웹 개발 모드의 Strict Mode에서 소비될 수 있으므로, 실제 신청 대상은 URL 쿼리를 기준으로 복원한다.
  const selectedPetIds = useMemo(
    () =>
      (searchParams.get('petIds') ?? '')
        .split(',')
        .map(Number)
        .filter((petId) => Number.isSafeInteger(petId) && petId > 0),
    [searchParams]
  );
  const isSubmitEnabled = isAgreed && selectedPetIds.length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!isAgreed || isSubmitting || selectedPetIds.length === 0) return;

    setIsSubmitting(true);
    try {
      const response = await postGuardianApplication({ token, petIds: selectedPetIds });
      const results = response.data?.results ?? [];
      const failedPets = selectedPetIds
        .filter((petId) => results.find((result) => result.petId === petId)?.success !== true)
        .map((petId) => ({
          id: petId,
          name: selectedPets.find((pet) => pet.petId === petId)?.name ?? '강아지',
        }));

      if (results.some((result) => result.success)) {
        // 신청 결과가 표시되는 모든 화면의 상태를 함께 갱신한다.
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [GUARDIAN_HOME_QUERY_KEY],
            refetchType: 'all',
          }),
          queryClient.invalidateQueries({
            queryKey: guardianPetConnectionStatusesQueryKey,
            refetchType: 'all',
          }),
          queryClient.invalidateQueries({
            queryKey: [PET_LIST_QUERY_KEY],
            refetchType: 'all',
          }),
        ]);
      }

      await replace({
        pathname: route.invite.guardian.complete.root.replace('[token]', encodeURIComponent(token)),
        query: { status: failedPets.length === 0 ? 'success' : 'application-failed' },
        params: failedPets.length > 0 ? { failedPets } : undefined,
      });
    } catch (error) {
      const isInvalidInvite = error instanceof ApiError && error.code.startsWith('GUARDIAN_INVITE-');
      await replace({
        pathname: route.invite.guardian.complete.root.replace('[token]', encodeURIComponent(token)),
        query: { status: isInvalidInvite ? 'invalid-invite' : 'application-failed' },
        params: isInvalidInvite
          ? undefined
          : {
              failedPets: selectedPetIds.map((petId) => ({
                id: petId,
                name: selectedPets.find((pet) => pet.petId === petId)?.name ?? '강아지',
              })),
            },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    void replace({ pathname: route.invite.guardian.pet.root.replace('[token]', encodeURIComponent(token)) });
  };

  return (
    <SafeArea edges={['bottom']} className='bg-bg-0 flex h-dvh flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>개인정보 수집 및 이용 동의</Header.Title>
      </Header>

      <div className='shrink-0 px-x4 py-x2'>
        <ProgressBar totalSteps={3} value={3} className='h-1.5' />
      </div>

      <main className='min-h-0 flex-1 overflow-y-auto py-x5'>
        <section className='flex flex-col px-x4'>
          <h1 className='h2-extrabold text-text-primary'>
            개인정보 수집·이용 및
            <br />
            유치원 제공에 동의해 주세요
          </h1>

          <div className='flex flex-col gap-y-2 py-x4'>
            <Checkbox
              size='sm'
              checked={isAgreed}
              onCheckedChange={setIsAgreed}
              className='border-line-200 radius-r2 flex h-x14 w-full cursor-pointer border bg-bg-0 px-x4 py-x4'
            >
              <span className={`body1-bold ${isAgreed ? 'text-text-primary' : 'text-text-secondary'}`}>
                개인정보 수집·이용 및 제3자 제공 동의
              </span>
            </Checkbox>

            <ScrollBar
              className='radius-r2 h-[346px] bg-fill-secondary-50'
              viewportProps={{ 'aria-label': '개인정보 수집 및 이용 동의 내용' }}
            >
              <div className='body1-regular text-text-primary'>
                <p>{privacyConsentPolicyIntro}</p>

                <div className='mt-[24px]'>
                  {privacyConsentPolicySections.map((section) => (
                    <section key={section.title} className='mb-[24px]'>
                      <h2>{section.title}</h2>
                      <ul className='list-disc pl-x5'>
                        {section.items.map((item) => (
                          <li key={item.text}>
                            {item.text}
                            {item.note ? <p>{item.note}</p> : null}
                            {item.nestedItem ? (
                              <ul className='list-[circle] pl-x5'>
                                <li>{item.nestedItem}</li>
                              </ul>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}

                  {privacyConsentPolicyClosing.map((paragraph, index) => (
                    <p key={paragraph} className={index < privacyConsentPolicyClosing.length - 1 ? 'mb-[24px]' : undefined}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </ScrollBar>
          </div>
        </section>
      </main>

      <div className='bg-bg-0 px-x4 py-x5'>
        <ActionButton
          type='button'
          size='large'
          disabled={!isSubmitEnabled}
          onClick={() => void handleSubmit()}
        >
          유치원 등록
        </ActionButton>
      </div>
    </SafeArea>
  );
}

export { GuardianInvitePrivacyConsentPage };
