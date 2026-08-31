'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { postCreateGuardianApplication } from '@entities/guardian-application';
import { trackConnectionStatus, getInviteEntrySource } from '@shared/lib/analytics';
import { GUARDIAN_HOME_QUERY_KEY } from '@entities/guardian-home';
import {
  GUARDIAN_PET_CONNECTION_STATUSES_QUERY_KEY,
  type GuardianPetConnection,
  useGuardianPetConnectionStatusesQuery,
} from '@entities/guardian-invite';
import { PET_LIST_QUERY_KEY } from '@entities/pet';
import {
  USER_AGREEMENT_TERM,
  postUserAgreements,
  useUserAgreementsStatusQuery,
  userAgreementsStatusQueryKey,
  useUserStore,
} from '@entities/user';
import { ApiError } from '@shared/api';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';

type SelectedGuardianPet = Pick<GuardianPetConnection, 'petId' | 'name'>;

function useGuardianInvitePrivacyConsentPage() {
  const { token } = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  const { getParams, replace } = useStackNavigation();
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.user?.userId);
  const petConnectionStatusesQuery = useGuardianPetConnectionStatusesQuery({ userId });
  const userAgreementsStatusQuery = useUserAgreementsStatusQuery(userId);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPets] = useState<SelectedGuardianPet[]>(
    () => getParams<{ selectedPets?: SelectedGuardianPet[] }>()?.selectedPets ?? []
  );
  // 스택 params는 웹 개발 모드의 Strict Mode에서 소비될 수 있으므로, 실제 신청 대상은 URL 쿼리를 기준으로 복원한다.
  const selectedPetIds = useMemo(
    () =>
      Array.from(
        new Set(
          (searchParams.get('petIds') ?? '')
            .split(',')
            .map(Number)
            .filter((petId) => Number.isSafeInteger(petId) && petId > 0)
        )
      ),
    [searchParams]
  );
  const hasAgreedRequiredTerms = userAgreementsStatusQuery.data?.data?.hasAgreedRequiredTerms === true;

  useEffect(() => {
    if (hasAgreedRequiredTerms) setIsAgreed(true);
  }, [hasAgreedRequiredTerms]);

  const isSubmitEnabled =
    isAgreed &&
    selectedPetIds.length > 0 &&
    !isSubmitting &&
    !userAgreementsStatusQuery.isLoading &&
    !userAgreementsStatusQuery.isError;

  const handleSubmit = async () => {
    if (!isAgreed || isSubmitting || selectedPetIds.length === 0) return;

    setIsSubmitting(true);
    try {
      // 서버는 필수 약관 전체를 한 요청에서 검증한다. 이미 저장된 동의는 upsert로 유지한다.
      if (!hasAgreedRequiredTerms) {
        await postUserAgreements({
          agreedTerms: [
            USER_AGREEMENT_TERM.TERMS_OF_SERVICE,
            USER_AGREEMENT_TERM.PRIVACY_POLICY,
            USER_AGREEMENT_TERM.AGE_OVER_14,
          ],
        });
        await queryClient.invalidateQueries({ queryKey: userAgreementsStatusQueryKey(userId) });
      }

      // URL은 사용자가 수정할 수 있으므로, 제출 직전에 최신 선택 가능 상태를 다시 확인한다.
      const latestConnections = await petConnectionStatusesQuery.refetch();
      const selectablePetIds = new Set(
        latestConnections.data?.data?.pets
          .filter((pet) => pet.connectionStatus == null)
          .map((pet) => pet.petId) ?? []
      );
      const validPetIds = selectedPetIds.filter((petId) => selectablePetIds.has(petId));

      if (latestConnections.isError || validPetIds.length !== selectedPetIds.length) {
        await replace({ pathname: route.invite.guardian.pet.root.replace('[token]', encodeURIComponent(token)) });
        return;
      }

      const response = await postCreateGuardianApplication({ token, petIds: validPetIds });
      const results = response.data?.results ?? [];
      const hasSuccess = results.some((result) => result.success === true);
      if (hasSuccess) {
        trackConnectionStatus({
          status: 'submit',
          actor: 'guardian',
          entry_source: getInviteEntrySource(),
        });
      }
      const failedPets = validPetIds
        .filter((petId) => results.find((result) => result.petId === petId)?.success !== true)
        .map((petId) => ({
          id: petId,
          name: selectedPets.find((pet) => pet.petId === petId)?.name ?? '강아지',
        }));

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [GUARDIAN_HOME_QUERY_KEY], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: [GUARDIAN_PET_CONNECTION_STATUSES_QUERY_KEY], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: [PET_LIST_QUERY_KEY], refetchType: 'all' }),
      ]);

      await replace({
        pathname: route.invite.guardian.complete.root.replace('[token]', encodeURIComponent(token)),
        query: { status: failedPets.length === 0 ? 'success' : 'application-failed' },
        params: failedPets.length > 0 ? { failedPets } : undefined,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        try {
          await replace({
            pathname: route.auth.login.root,
            params: {
              redirectTo: route.invite.guardian.root.replace('[token]', encodeURIComponent(token)),
            },
          });
        } catch {
          toast('로그인 화면으로 이동하지 못했어요. 다시 시도해 주세요.');
        }
        return;
      }

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

  const handleBack = () =>
    replace({ pathname: route.invite.guardian.pet.root.replace('[token]', encodeURIComponent(token)) });

  return {
    isAgreed,
    isSubmitEnabled,
    handleAgreedChange: setIsAgreed,
    handleSubmit,
    handleBack,
  };
}

export { useGuardianInvitePrivacyConsentPage };
