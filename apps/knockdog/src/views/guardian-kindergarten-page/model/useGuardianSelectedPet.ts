'use client';

import { useEffect, useState } from 'react';

import {
  MOCK_CONNECTION_STATUS,
  MOCK_PET_CONNECTION_BY_NAME,
} from '../config/guardianKindergartenMock';
import type { Pet } from '@entities/pet';
import { usePetListQuery, usePetRepresentativeQuery } from '@entities/pet';
import { useUserStore } from '@entities/user';
import { tokenUtils } from '@shared/utils';

import type { GuardianKindergartenConnectionStatus } from './guardianKindergartenConnection';
import { useGuardianKindergartenMockStore } from './useGuardianKindergartenMockStore';

function hasUserStoreHydrated() {
  return useUserStore.persist?.hasHydrated?.() ?? true;
}

function resolvePetConnectionStatus(pet: Pet): GuardianKindergartenConnectionStatus {
  const byName = MOCK_PET_CONNECTION_BY_NAME[pet.name];
  if (byName) return byName;
  if (pet.isRepresentative) return MOCK_CONNECTION_STATUS;
  return 'none';
}

function useGuardianSelectedPet() {
  const userId = useUserStore((state) => state.user?.userId);
  const [isUserStoreHydrated, setIsUserStoreHydrated] = useState(hasUserStoreHydrated);
  // token만 있고 user 미동기화 — pet 쿼리(userId 필요)가 비활성인 채 isFetched===false로 남을 수 있음
  const isAuthSyncing = !userId && tokenUtils.hasAccessToken();

  useEffect(() => {
    const unsubscribe = useUserStore.persist?.onFinishHydration?.(() => {
      setIsUserStoreHydrated(true);
    });

    if (hasUserStoreHydrated()) {
      setIsUserStoreHydrated(true);
    }

    return unsubscribe;
  }, []);

  // 다른 WebView 로그인 직후 이 탭 store에 user가 없을 때 persist 재동기화
  useEffect(() => {
    if (!isUserStoreHydrated || !isAuthSyncing) return;
    void useUserStore.persist?.rehydrate?.();
  }, [isAuthSyncing, isUserStoreHydrated]);

  const {
    data: petListResponse,
    isFetched,
    isSuccess,
    isError,
    isFetching,
    refetch,
  } = usePetListQuery();
  const { data: representativePet } = usePetRepresentativeQuery();
  const selectedPetId = useGuardianKindergartenMockStore((state) => state.selectedPetId);
  const setSelectedPetId = useGuardianKindergartenMockStore((state) => state.setSelectedPetId);

  const pets = petListResponse?.data ?? [];
  const selectedPet =
    pets.find((pet) => pet.id === selectedPetId) ?? representativePet ?? pets[0] ?? null;

  return {
    pets,
    /** 펫 목록 최초 조회 완료 — userId 확보 전(isFetched false)을 ready로 취급하지 않음 */
    isPetsReady: isUserStoreHydrated && Boolean(userId) && isFetched,
    /** 성공 응답이면서 목록이 비어 있을 때만 미등록으로 취급 */
    hasNoPet: isSuccess && pets.length === 0,
    isPetsError: isError,
    isPetsFetching: isAuthSyncing || isFetching,
    refetchPets: refetch,
    selectedPet,
    selectedPetId: selectedPet?.id ?? null,
    setSelectedPetId,
    getPetConnectionStatus: resolvePetConnectionStatus,
  };
}

export { useGuardianSelectedPet, resolvePetConnectionStatus };
