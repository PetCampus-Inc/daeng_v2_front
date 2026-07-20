import { useEffect, useMemo, useRef, useState } from 'react';

import { route } from '@shared/constants/route';
import { useStackNavigation, waitForNavParams } from '@shared/lib/bridge';
import { isNativeWebView } from '@shared/lib/device';

import { formatAddress, formatName, formatPhone, isValidKindergartenPhone, isValidRepresentativePhone } from '@features/role-conversion/lib/formatKindergartenRegisterField';

import { kindergartenRegisterContent } from '@views/role-conversion/kindergarten-register/config/kindergartenRegisterContent';
import {
  clearRegisterFormDraft,
  loadRegisterFormDraft,
  saveRegisterFormDraft,
} from '@views/role-conversion/kindergarten-register/lib/registerFormDraft';
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

const fieldFormatters = {
  name: formatName,
  address: formatAddress,
  addressDetail: formatAddress,
  kindergartenNumber: formatPhone,
  ownerName: formatName,
  phoneNumber: formatPhone,
} as const;

const requiredFields = ['name', 'address', 'kindergartenNumber', 'ownerName', 'phoneNumber'] as const;

type PhoneField = 'kindergartenNumber' | 'phoneNumber';

const phoneFieldValidators = {
  kindergartenNumber: isValidKindergartenPhone,
  phoneNumber: isValidRepresentativePhone,
} as const;

const phoneFieldErrorMessages = {
  kindergartenNumber: kindergartenRegisterContent.numberFormatError,
  phoneNumber: kindergartenRegisterContent.phoneFormatError,
} as const;

function resolveInitialForm(
  mode: KindergartenRegisterSource,
  getParams: () => { searchPrefill?: SearchPrefill } | null
): { form: KindergartenRegisterForm; fromNavPrefill: boolean } {
  if (mode === 'manual') {
    const draft = loadRegisterFormDraft();
    if (draft?.source === 'manual') {
      return { form: draft, fromNavPrefill: false };
    }

    return { form: emptyRegisterForm, fromNavPrefill: false };
  }

  // 네이티브: 첫 렌더에서 storage/cache fallback으로 stale prefill을 확정하지 않음
  // (params 주입이 늦을 수 있어 waitForNavParams 이후 fallback)
  if (isNativeWebView()) {
    const navPrefill = readNavSearchPrefill(getParams);

    if (navPrefill) {
      saveSearchPrefill(navPrefill);
      return { form: fromSearchPrefill(navPrefill), fromNavPrefill: true };
    }

    return { form: emptyRegisterForm, fromNavPrefill: false };
  }

  const prefill = consumeSearchPrefillInit(getParams);

  if (prefill) {
    return { form: fromSearchPrefill(prefill), fromNavPrefill: !!readNavSearchPrefill(getParams) };
  }

  return { form: emptyRegisterForm, fromNavPrefill: false };
}

function useKindergartenRegisterPage(mode: KindergartenRegisterSource) {
  const { getParams, push, pushForResult, back } = useStackNavigation();
  const initialResolvedRef = useRef<ReturnType<typeof resolveInitialForm> | null>(null);
  const [form, setForm] = useState<KindergartenRegisterForm>(() => {
    const resolved = resolveInitialForm(mode, getParams);
    initialResolvedRef.current = resolved;
    return resolved.form;
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<PhoneField, string>>>({});
  // nav params로 확정된 경우만 resolved — storage/cache만으로는 wait 스킵하지 않음
  const hasSearchPrefillRef = useRef(
    mode === 'search' && (initialResolvedRef.current?.fromNavPrefill ?? false)
  );

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
    () =>
      requiredFields.every((field) => form[field].trim().length > 0) &&
      isValidKindergartenPhone(form.kindergartenNumber) &&
      isValidRepresentativePhone(form.phoneNumber),
    [form]
  );

  const handleFieldChange = (field: keyof KindergartenRegisterForm, value: string) => {
    if (field === 'source' || field === 'placeId') return;
    if (field === 'address' && mode === 'manual') return;

    if (field === 'kindergartenNumber' || field === 'phoneNumber') {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    setForm((prev) => {
      const next = { ...prev, [field]: fieldFormatters[field](value) };

      if (mode === 'manual') {
        saveRegisterFormDraft(next);
      }

      return next;
    });
  };

  const handlePhoneFieldBlur = (field: PhoneField) => {
    const value = form[field].trim();

    if (!value) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
      return;
    }

    const isValid = phoneFieldValidators[field](value);

    setFieldErrors((prev) => ({
      ...prev,
      [field]: isValid ? undefined : phoneFieldErrorMessages[field],
    }));
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
    fieldErrors,
    isNextEnabled,
    isManualMode: mode === 'manual',
    handleFieldChange,
    handlePhoneFieldBlur,
    handleAddressSearch,
    handleClearAddress,
    handleBack,
    handleNextClick,
  };
}

export { useKindergartenRegisterPage };
