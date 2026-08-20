'use client';

import { useEffect, useState } from 'react';

import { usePetListQuery, usePetRepresentativeQuery } from '@entities/pet';
import { useUserStore } from '@entities/user';
import { tokenUtils } from '@shared/utils';

import { useGuardianSelectedPetStore } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPetStore';

function hasUserStoreHydrated() {
  return useUserStore.persist?.hasHydrated?.() ?? true;
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
    useUserStore.persist?.rehydrate?.();
  }, [isAuthSyncing, isUserStoreHydrated]);

  // 미리 떠 있는 WebView — 다른 WebView에서 쓴 선택 강아지를 다시 읽는다
  useEffect(() => {
    useGuardianSelectedPetStore.persist?.rehydrate?.();
  }, []);

  const {
    data: petListResponse,
    isFetched,
    isSuccess,
    isError,
    isFetching,
    refetch,
  } = usePetListQuery();
  const { data: representativePet } = usePetRepresentativeQuery();
  const selectedPetId = useGuardianSelectedPetStore((state) => state.selectedPetId);
  const setSelectedPetId = useGuardianSelectedPetStore((state) => state.setSelectedPetId);

  const pets = petListResponse?.data ?? [];
  const selectedPet =
    pets.find((pet) => selectedPetId != null && String(pet.id) === String(selectedPetId)) ??
    representativePet ??
    pets[0] ??
    null;

  const isPetsReady = isUserStoreHydrated && Boolean(userId) && isFetched;

  return {
    pets,
    /** 펫 목록 최초 조회 완료 — userId 확보 전(isFetched false)을 ready로 취급하지 않음 */
    isPetsReady,
    /** 성공 응답이면서 목록이 비어 있을 때만 미등록으로 취급 */
    hasNoPet: isSuccess && pets.length === 0,
    isPetsError: isError,
    isPetsFetching: isAuthSyncing || isFetching,
    refetchPets: refetch,
    selectedPet,
    selectedPetId: selectedPet?.id ?? null,
    setSelectedPetId,
  };
}

export { useGuardianSelectedPet };
