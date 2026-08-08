'use client';

import {
  MOCK_CONNECTION_STATUS,
  MOCK_PET_CONNECTION_BY_NAME,
} from '../config/guardianKindergartenMock';
import type { Pet } from '@entities/pet';
import { usePetListQuery, usePetRepresentativeQuery } from '@entities/pet';

import type { GuardianKindergartenConnectionStatus } from './guardianKindergartenConnection';
import { useGuardianKindergartenMockStore } from './useGuardianKindergartenMockStore';

function resolvePetConnectionStatus(pet: Pet): GuardianKindergartenConnectionStatus {
  const byName = MOCK_PET_CONNECTION_BY_NAME[pet.name];
  if (byName) return byName;
  if (pet.isRepresentative) return MOCK_CONNECTION_STATUS;
  return 'none';
}

function useGuardianSelectedPet() {
  const { data: petListResponse, isFetched } = usePetListQuery();
  const { data: representativePet } = usePetRepresentativeQuery();
  const selectedPetId = useGuardianKindergartenMockStore((state) => state.selectedPetId);
  const setSelectedPetId = useGuardianKindergartenMockStore((state) => state.setSelectedPetId);

  const pets = petListResponse?.data ?? [];
  const selectedPet =
    pets.find((pet) => pet.id === selectedPetId) ?? representativePet ?? pets[0] ?? null;

  return {
    pets,
    /** 펫 목록 최초 조회 완료 여부 — 미등록 empty 플래시 방지 */
    isPetsReady: isFetched,
    selectedPet,
    selectedPetId: selectedPet?.id ?? null,
    setSelectedPetId,
    getPetConnectionStatus: resolvePetConnectionStatus,
  };
}

export { useGuardianSelectedPet, resolvePetConnectionStatus };
