import { useEffect, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { postKindergartenManual, postKindergartenSelect, saveSession } from '@entities/owner-verification';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';
import {
  clearDraft,
  clearSearchPrefill,
  readParams,
  saveSearchPrefill,
} from '@views/role-conversion/model/kindergartenConfirmParams';
import { toDisplayItems } from '@views/role-conversion/model/kindergartenInfo';
import { toManualRequest } from '../lib/toManualRequest';
import { toSelectRequest } from '../lib/toSelectRequest';
function useKindergartenConfirmPage() {

  const { back, getParams, push, replace } = useStackNavigation();
  const kindergartenInfo = useMemo(() => readParams(getParams), [getParams]);
  const displayItems = useMemo(
    () => (kindergartenInfo ? toDisplayItems(kindergartenInfo) : []),
    [kindergartenInfo]
  );
  const proceedToBusinessVerification = () => {
    if (!kindergartenInfo) return;
    clearDraft();
    push({
      pathname: route.roleConversion.businessVerification.root,
      params: { kindergarten: kindergartenInfo },
    });
  };
  const { mutate: selectKindergarten, isPending: isSelectPending } = useMutation({
    mutationFn: postKindergartenSelect,
    onSuccess: ({ data }) => {
      if (!kindergartenInfo) return;
      saveSession(data);
      proceedToBusinessVerification();
    },
    onError: (error) => {
      console.error('[selectKindergarten]', error);

      toast({
        title: '유치원 정보 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.',
        shape: 'square',
        position: 'top',
      });
    },
  });

  const { mutate: manualKindergarten, isPending: isManualPending } = useMutation({
    mutationFn: postKindergartenManual,
    onSuccess: ({ data }) => {

      if (!kindergartenInfo) return;
      saveSession(data);
      proceedToBusinessVerification();
    },

    onError: (error) => {
      console.error('[manualKindergarten]', error);
      toast({
        title: '유치원 정보 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.',
        shape: 'square',
        position: 'top',
      });
    },
  });

  const isPending = isSelectPending || isManualPending;

  useEffect(() => {
    if (!kindergartenInfo) {
      back();
    }
  }, [back, kindergartenInfo]);

  const handleNo = () => {
    clearDraft();
    if (kindergartenInfo?.source === 'search' && kindergartenInfo.placeId) {
      const searchPrefill = {
        placeId: kindergartenInfo.placeId,
        name: kindergartenInfo.name,
        address: kindergartenInfo.address,
        kindergartenNumber: kindergartenInfo.kindergartenNumber,
      };

      saveSearchPrefill(searchPrefill);
      replace({
        pathname: route.roleConversion.kindergartenRegister.root,
        query: { mode: 'search', reset: Date.now().toString() },
        params: { searchPrefill },
      });
      return;
    }

    clearSearchPrefill();
    replace({
      pathname: route.roleConversion.kindergartenRegister.root,
      query: { reset: Date.now().toString() },
    });
  };

  const handleYes = () => {
    if (!kindergartenInfo || isPending) return;
    const selectRequest = toSelectRequest(kindergartenInfo);
    if (selectRequest) {
      selectKindergarten(selectRequest);
      return;
    }

    const manualRequest = toManualRequest(kindergartenInfo);
    if (manualRequest) {
      manualKindergarten(manualRequest);
      return;
    }
    proceedToBusinessVerification();
  };

  return {
    displayItems,
    isReady: displayItems.length > 0,
    isPending,
    handleNo,
    handleYes,
  };
}

export { useKindergartenConfirmPage };

