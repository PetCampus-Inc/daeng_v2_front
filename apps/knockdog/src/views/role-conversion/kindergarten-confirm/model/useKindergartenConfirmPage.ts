import { useEffect, useMemo } from 'react';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

import {
  clearDraft,
  clearSearchPrefill,
  readParams,
  saveSearchPrefill,
} from '@views/role-conversion/model/kindergartenConfirmParams';
import { toDisplayItems } from '@views/role-conversion/model/kindergartenInfo';

function useKindergartenConfirmPage() {
  const { back, getParams, push, replace } = useStackNavigation();

  const kindergartenInfo = useMemo(() => readParams(getParams), [getParams]);
  const displayItems = useMemo(
    () => (kindergartenInfo ? toDisplayItems(kindergartenInfo) : []),
    [kindergartenInfo]
  );

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
    if (!kindergartenInfo) return;

    clearDraft();
    push({
      pathname: route.roleConversion.businessVerification.root,
      params: { kindergarten: kindergartenInfo },
    });
  };

  return {
    displayItems,
    isReady: displayItems.length > 0,
    handleNo,
    handleYes,
  };
}

export { useKindergartenConfirmPage };
