import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { postKindergartenManual, postKindergartenSelect, saveSession } from '@entities/owner-verification';
import { trackOwnerVerificationStatus } from '@shared/lib/analytics';
import { route } from '@shared/constants/route';
import { useStackNavigation, waitForNavParams } from '@shared/lib/bridge';
import { isNativeWebView } from '@shared/lib/device';
import { toast } from '@shared/ui/toast';
import {
  clearDraft,
  clearSearchPrefill,
  readParams,
  saveSearchPrefill,
} from '@views/role-conversion/model/kindergartenConfirmParams';
import { saveRegisterFormDraft, clearRegisterFormDraft } from '@views/role-conversion/kindergarten-register/lib/registerFormDraft';
import {
  fromKindergartenInfo,
  toDisplayItems,
  type RoleConversionKindergartenInfo,
} from '@views/role-conversion/model/kindergartenInfo';
import { handleOwnerVerificationAuthError } from '@views/role-conversion/complete/lib/handleOwnerVerificationAuthError';
import { toManualRequest } from '../lib/toManualRequest';
import { toSelectRequest } from '../lib/toSelectRequest';

function useKindergartenConfirmPage() {
  const { back, getParams, push, replace } = useStackNavigation();
  const [kindergartenInfo, setKindergartenInfo] = useState<RoleConversionKindergartenInfo | null>(() =>
    readParams(getParams)
  );
  const [isParamsResolved, setIsParamsResolved] = useState(() => {
    if (!isNativeWebView()) return true;
    return !!readParams(getParams);
  });

  // 네이티브: confirm으로 push된 params가 첫 렌더에 없으면 잠깐 대기 (즉시 back 방지)
  useEffect(() => {
    if (isParamsResolved) return;

    return waitForNavParams(
      () => readParams(getParams),
      (info) => {
        if (info) setKindergartenInfo(info);
        setIsParamsResolved(true);
      }
    );
  }, [getParams, isParamsResolved]);

  const displayItems = useMemo(
    () => (kindergartenInfo ? toDisplayItems(kindergartenInfo) : []),
    [kindergartenInfo]
  );

  const proceedToBusinessVerification = () => {
    if (!kindergartenInfo) return;
    clearDraft();
    clearRegisterFormDraft();
    push({
      pathname: route.roleConversion.businessVerification.root,
      params: { kindergarten: kindergartenInfo },
    });
  };

  const handleMutationError = (error: unknown, label: string) => {
    console.error(`[${label}]`, error);

    if (handleOwnerVerificationAuthError(error)) return;

    toast({
      title: '유치원 정보 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      shape: 'square',
      position: 'top',
    });
  };

  const { mutate: selectKindergarten, isPending: isSelectPending } = useMutation({
    mutationFn: postKindergartenSelect,
    onSuccess: ({ data }) => {
      if (!kindergartenInfo) return;
      saveSession(data, {
        source: kindergartenInfo.source,
        placeId: kindergartenInfo.placeId,
        name: kindergartenInfo.name,
        address: kindergartenInfo.address,
        ownerName: kindergartenInfo.ownerName,
        phoneNumber: kindergartenInfo.phoneNumber,
      });
      trackOwnerVerificationStatus({ status: 'start' });
      proceedToBusinessVerification();
    },
    onError: (error) => {
      handleMutationError(error, 'selectKindergarten');
    },
  });

  const { mutate: manualKindergarten, isPending: isManualPending } = useMutation({
    mutationFn: postKindergartenManual,
    onSuccess: ({ data }) => {
      if (!kindergartenInfo) return;
      saveSession(data, {
        source: kindergartenInfo.source,
        placeId: kindergartenInfo.placeId,
        name: kindergartenInfo.name,
        address: kindergartenInfo.address,
        ownerName: kindergartenInfo.ownerName,
        phoneNumber: kindergartenInfo.phoneNumber,
      });
      trackOwnerVerificationStatus({ status: 'start' });
      proceedToBusinessVerification();
    },
    onError: (error) => {
      handleMutationError(error, 'manualKindergarten');
    },
  });

  const isPending = isSelectPending || isManualPending;

  useEffect(() => {
    if (!isParamsResolved) return;
    if (!kindergartenInfo) {
      back();
    }
  }, [back, isParamsResolved, kindergartenInfo]);

  const handleNo = () => {
    if (!kindergartenInfo) return;

    const registerForm = fromKindergartenInfo(kindergartenInfo);
    saveRegisterFormDraft(registerForm);
    clearDraft();

    if (kindergartenInfo.source === 'search' && kindergartenInfo.placeId) {
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
        params: { searchPrefill, registerForm },
      });
      return;
    }

    clearSearchPrefill();
    replace({
      pathname: route.roleConversion.kindergartenRegister.root,
      query: { reset: Date.now().toString() },
      params: { registerForm },
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

    // select/manual request를 만들 수 없으면 saveSession 없이 다음 단계로 보내지 않음
    toast({
      title: '유치원 정보가 올바르지 않습니다. 다시 선택해 주세요.',
      shape: 'square',
      position: 'top',
    });
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
