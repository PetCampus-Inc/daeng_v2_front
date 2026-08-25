import { useEffect, useMemo, useRef, useState } from 'react';

import { route } from '@shared/constants/route';
import { useStackNavigation, waitForNavParams } from '@shared/lib/bridge';
import { isNativeWebView } from '@shared/lib/device';

import type { Address } from '@entities/address';
import {
  formatAddress,
  formatName,
  formatPhone,
  formatRepresentativeName,
  isValidKindergartenPhone,
  isValidRepresentativePhone,
} from '@features/role-conversion/lib/formatKindergartenRegisterField';

import { kindergartenRegisterContent } from '@views/role-conversion/kindergarten-register/config/kindergartenRegisterContent';
import {
  clearRegisterFormDraft,
  isKindergartenRegisterForm,
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
  loadSearchPrefill,
  readNavSearchPrefill,
  saveDraft,
  saveSearchPrefill,
} from '@views/role-conversion/model/kindergartenConfirmParams';

const fieldFormatters = {
  name: formatName,
  address: formatAddress,
  addressDetail: formatAddress,
  kindergartenNumber: formatPhone,
  ownerName: formatRepresentativeName,
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

type RegisterNavParams = {
  searchPrefill?: SearchPrefill;
  registerForm?: KindergartenRegisterForm;
};

function readNavRegisterForm(
  getParams: () => RegisterNavParams | null,
  mode: KindergartenRegisterSource
): KindergartenRegisterForm | null {
  const navForm = getParams()?.registerForm;
  if (!navForm || !isKindergartenRegisterForm(navForm)) return null;
  if (navForm.source !== mode) return null;
  return navForm;
}

function resolveInitialForm(
  mode: KindergartenRegisterSource,
  getParams: () => RegisterNavParams | null
): { form: KindergartenRegisterForm; fromNavPrefill: boolean; isRestoredDraft: boolean } {
  const navRegisterForm = readNavRegisterForm(getParams, mode);
  if (navRegisterForm) {
    saveRegisterFormDraft(navRegisterForm);
    return { form: navRegisterForm, fromNavPrefill: false, isRestoredDraft: true };
  }

  const registerDraft = loadRegisterFormDraft();

  if (registerDraft?.source === mode) {
    if (mode === 'manual') {
      return { form: registerDraft, fromNavPrefill: false, isRestoredDraft: true };
    }

    const navPrefill = readNavSearchPrefill(getParams);

    if (isNativeWebView()) {
      if (navPrefill) {
        if (registerDraft.placeId === navPrefill.placeId) {
          return { form: registerDraft, fromNavPrefill: false, isRestoredDraft: true };
        }

        clearRegisterFormDraft();
      }
      // nav params 주입 전에는 draft를 확정하지 않음 — waitForNavParams에서 재판단
    } else {
      const prefillForCompare = navPrefill ?? loadSearchPrefill();
      if (!prefillForCompare || registerDraft.placeId === prefillForCompare.placeId) {
        return { form: registerDraft, fromNavPrefill: false, isRestoredDraft: true };
      }

      clearRegisterFormDraft();
    }
  }

  if (mode === 'manual') {
    return { form: emptyRegisterForm, fromNavPrefill: false, isRestoredDraft: false };
  }

  // 네이티브: 첫 렌더에서 storage/cache fallback으로 stale prefill을 확정하지 않음
  if (isNativeWebView()) {
    const navPrefill = readNavSearchPrefill(getParams);

    if (navPrefill) {
      saveSearchPrefill(navPrefill);
      return { form: fromSearchPrefill(navPrefill), fromNavPrefill: true, isRestoredDraft: false };
    }

    return { form: emptyRegisterForm, fromNavPrefill: false, isRestoredDraft: false };
  }

  const prefill = consumeSearchPrefillInit(getParams);

  if (prefill) {
    return {
      form: fromSearchPrefill(prefill),
      fromNavPrefill: !!readNavSearchPrefill(getParams),
      isRestoredDraft: false,
    };
  }

  return { form: emptyRegisterForm, fromNavPrefill: false, isRestoredDraft: false };
}

function useKindergartenRegisterPage(mode: KindergartenRegisterSource) {
  const { getParams, push, back } = useStackNavigation();
  const [initialResolved] = useState(() => resolveInitialForm(mode, getParams));
  const [form, setForm] = useState<KindergartenRegisterForm>(initialResolved.form);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<PhoneField, string>>>({});
  const hasSearchPrefillRef = useRef(
    mode === 'search' &&
      (initialResolved.fromNavPrefill ||
        (initialResolved.isRestoredDraft && Boolean(readNavSearchPrefill(getParams))))
  );

  useEffect(() => {
    if (mode !== 'search' || hasSearchPrefillRef.current) return;

    if (!isNativeWebView()) {
      const navRegisterForm = readNavRegisterForm(getParams, mode);
      if (navRegisterForm) {
        hasSearchPrefillRef.current = true;
        saveRegisterFormDraft(navRegisterForm);
        setForm(navRegisterForm);
        return;
      }

      const prefill = consumeSearchPrefillInit(getParams);
      if (prefill) {
        hasSearchPrefillRef.current = true;
        const draft = loadRegisterFormDraft();
        if (draft?.source === 'search' && draft.placeId === prefill.placeId) {
          setForm(draft);
          return;
        }
        setForm(fromSearchPrefill(prefill));
      }
      return;
    }

    return waitForNavParams(
      () => {
        const navForm = readNavRegisterForm(getParams, mode);
        if (navForm) return { type: 'form' as const, form: navForm };

        const navPrefill = readNavSearchPrefill(getParams);
        if (navPrefill) return { type: 'prefill' as const, prefill: navPrefill };

        return null;
      },
      (resolved) => {
        if (resolved?.type === 'form') {
          hasSearchPrefillRef.current = true;
          saveRegisterFormDraft(resolved.form);
          setForm(resolved.form);
          return;
        }

        if (resolved?.type === 'prefill') {
          const navPrefill = resolved.prefill;
          saveSearchPrefill(navPrefill);
          hasSearchPrefillRef.current = true;

          const draft = loadRegisterFormDraft();
          if (draft?.source === 'search' && draft.placeId === navPrefill.placeId) {
            setForm(draft);
            return;
          }

          if (draft?.source === 'search') {
            clearRegisterFormDraft();
          }

          setForm(fromSearchPrefill(navPrefill));
          return;
        }

        const draft = loadRegisterFormDraft();
        if (draft?.source === 'search') {
          hasSearchPrefillRef.current = true;
          setForm(draft);
          return;
        }

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
    if (field === 'address') return;

    if (field === 'kindergartenNumber' || field === 'phoneNumber') {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    setForm((prev) => {
      const next = { ...prev, [field]: fieldFormatters[field](value) };

      saveRegisterFormDraft(next);

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

  const handleAddressSelect = (address: Address) => {
    const selectedAddress = formatAddress(address.roadAddress || address.address);

    setForm((prev) => {
      const next = { ...prev, address: selectedAddress };

      saveRegisterFormDraft(next);

      return next;
    });
  };

  const handleClearAddress = () => {
    setForm((prev) => {
      const next = { ...prev, address: '', addressDetail: '' };

      saveRegisterFormDraft(next);

      return next;
    });
  };

  const handleBack = () => {
    if (mode === 'manual') {
      clearRegisterFormDraft();
    }
    back?.();
  };

  const handleNextClick = () => {
    const kindergarten = toKindergartenInfo(form);

    if (kindergarten.source === 'manual') {
      clearSearchPrefill();
    }

    // 확인 "아니요" 복귀용 — 대표자명/전화 포함 draft 유지 (Stack WebView 간 localStorage)
    saveRegisterFormDraft(form);
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
    handleAddressSelect,
    handleClearAddress,
    handleBack,
    handleNextClick,
  };
}

export { useKindergartenRegisterPage };
