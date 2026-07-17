import { useEffect, useMemo, useRef, useState } from 'react';

import { route } from '@shared/constants/route';
import { useStackNavigation, waitForNavParams } from '@shared/lib/bridge';
import { isNativeWebView } from '@shared/lib/device';

import {
  emptyRegisterForm,
  fromSearchPrefill,
  toKindergartenInfo,
  type KindergartenRegisterForm,
  type KindergartenRegisterSource,
  type SearchPrefill,
} from '@views/role-conversion/model/kindergartenInfo';
import {
  clearSearchPrefill,
  consumeSearchPrefillInit,
  readNavSearchPrefill,
  saveDraft,
  saveSearchPrefill,
} from '@views/role-conversion/model/kindergartenConfirmParams';
import {
  clearRegisterFormDraft,
  loadRegisterFormDraft,
  saveRegisterFormDraft,
} from '@views/role-conversion/kindergarten-register/lib/registerFormDraft';

import { formatAddress, formatName, formatPhone } from '@features/role-conversion/lib/formatKindergartenRegisterField';

const fieldFormatters = {
  name: formatName,
  address: formatAddress,
  addressDetail: formatAddress,
  kindergartenNumber: formatPhone,
  ownerName: formatName,
  phoneNumber: formatPhone,
} as const;

const requiredFields = ['name', 'address', 'kindergartenNumber', 'ownerName', 'phoneNumber'] as const;

function resolveInitialForm(
  mode: KindergartenRegisterSource,
  getParams: () => { searchPrefill?: SearchPrefill } | null
): KindergartenRegisterForm {
  if (mode === 'manual') {
    const draft = loadRegisterFormDraft();
    if (draft?.source === 'manual') {
      return draft;
    }

    return emptyRegisterForm;
  }

  const prefill = consumeSearchPrefillInit(getParams);

  if (prefill) {
    return fromSearchPrefill(prefill);
  }

  return emptyRegisterForm;
}

function useKindergartenRegisterPage(mode: KindergartenRegisterSource) {
  const { getParams, push, pushForResult, back } = useStackNavigation();
  const [form, setForm] = useState<KindergartenRegisterForm>(() => resolveInitialForm(mode, getParams));
  // stored prefill만으로 resolved 처리하지 않음 — native params 도착 전 stale 값에 고정되는 것 방지
  const hasSearchPrefillRef = useRef(mode === 'search' && !!readNavSearchPrefill(getParams));

  // 네이티브(특히 Android): history.state._params 주입이 첫 렌더보다 늦을 수 있음
  useEffect(() => {
    if (mode !== 'search' || hasSearchPrefillRef.current) return;

    if (!isNativeWebView()) {
      const prefill = consumeSearchPrefillInit(getParams);
      if (prefill) {
        hasSearchPrefillRef.current = true;
        setForm(fromSearchPrefill(prefill));
      }
      return;
    }

    return waitForNavParams(
      () => readNavSearchPrefill(getParams),
      (navPrefill) => {
        if (navPrefill) {
          saveSearchPrefill(navPrefill);
          hasSearchPrefillRef.current = true;
          setForm(fromSearchPrefill(navPrefill));
          return;
        }

        // timeout: stored/cache prefill fallback
        const fallback = consumeSearchPrefillInit(() => null);
        if (fallback) {
          hasSearchPrefillRef.current = true;
          setForm(fromSearchPrefill(fallback));
        }
      }
    );
  }, [getParams, mode]);

  const isNextEnabled = useMemo(
    () => requiredFields.every((field) => form[field].trim().length > 0),
    [form]
  );

  const handleFieldChange = (field: keyof KindergartenRegisterForm, value: string) => {
    if (field === 'source' || field === 'placeId') return;
    if (field === 'address' && mode === 'manual') return;

    setForm((prev) => {
      const next = { ...prev, [field]: fieldFormatters[field](value) };

      if (mode === 'manual') {
        saveRegisterFormDraft(next);
      }

      return next;
    });
  };

  const handleAddressSearch = async () => {
    // 웹 remount 복원용. 네이티브 주소 반환은 pushForResult (WebView 간 sessionStorage 미공유).
    saveRegisterFormDraft(form);

    try {
      const selectedAddress = await pushForResult<string>(
        {
          pathname: route.roleConversion.kindergartenRegister.address.root,
        },
        600_000
      );

      setForm((prev) => {
        const next = { ...prev, address: selectedAddress };
        saveRegisterFormDraft(next);
        return next;
      });
    } catch {
      // 결과 없이 back — no-op
    }
  };

  const handleClearAddress = () => {
    setForm((prev) => {
      const next = { ...prev, address: '', addressDetail: '' };

      if (mode === 'manual') {
        saveRegisterFormDraft(next);
      }

      return next;
    });
  };

  const handleBack = () => {
    // 등록 페이지를 완전히 나가면 draft 제거 (주소 검색 왕복은 pushForResult라 unmount/back 아님)
    if (mode === 'manual') {
      clearRegisterFormDraft();
    }
    back?.();
  };

  const handleNextClick = () => {
    const kindergarten = toKindergartenInfo(form);

    if (kindergarten.source === 'manual') {
      clearSearchPrefill();
      clearRegisterFormDraft();
    }

    saveDraft(kindergarten);
    push({
      pathname: route.roleConversion.kindergartenConfirm.root,
      params: { kindergarten },
    });
  };

  return {
    form,
    isNextEnabled,
    isManualMode: mode === 'manual',
    handleFieldChange,
    handleAddressSearch,
    handleClearAddress,
    handleBack,
    handleNextClick,
  };
}

export { useKindergartenRegisterPage };
