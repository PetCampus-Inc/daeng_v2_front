import { useEffect, useState } from 'react';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

import { clearDraft, readParams } from '../../model/kindergartenConfirmParams';
import {
  toDisplayItems,
  type KindergartenInfoDisplayItem,
  type RoleConversionKindergartenInfo,
} from '../../model/kindergartenInfo';

function useKindergartenConfirmPage() {
  const { back, getParams, push } = useStackNavigation();
  const [kindergartenInfo, setKindergartenInfo] = useState<RoleConversionKindergartenInfo | null>(null);
  const [displayItems, setDisplayItems] = useState<KindergartenInfoDisplayItem[]>([]);

  useEffect(() => {
    const kindergarten = readParams(getParams);

    if (!kindergarten) {
      back();
      return;
    }

    setKindergartenInfo(kindergarten);
    setDisplayItems(toDisplayItems(kindergarten));
  }, [back, getParams]);

  const handleNo = () => {
    clearDraft();
    back();
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
