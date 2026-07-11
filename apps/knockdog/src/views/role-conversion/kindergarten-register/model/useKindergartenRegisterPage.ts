import { useEffect, useMemo, useState } from 'react';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

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
  saveDraft,
} from '@views/role-conversion/model/kindergartenConfirmParams';
import {
  clearRegisterFormDraft,
  loadRegisterFormDraft,
  REGISTER_FORM_DRAFT_UPDATED_EVENT,
  saveRegisterFormDraft,
} from '@views/role-conversion/kindergarten-register/lib/registerFormDraft';

import { formatAddress, formatName, formatPhone } from '@features/role-conversion/lib/formatKindergartenRegisterField';

const fieldFormatters = {
  name: formatName,
  address: formatAddress,
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
  const { getParams, push } = useStackNavigation();
  const [form, setForm] = useState<KindergartenRegisterForm>(() => resolveInitialForm(mode, getParams));

  useEffect(() => {
    if (mode !== 'manual') return;

    function syncDraftFromStorage() {
      if (document.visibilityState === 'hidden') return;

      const draft = loadRegisterFormDraft();
      if (draft?.source === 'manual') {
        setForm(draft);
      }
    }

    syncDraftFromStorage();

    window.addEventListener('pageshow', syncDraftFromStorage);
    window.addEventListener(REGISTER_FORM_DRAFT_UPDATED_EVENT, syncDraftFromStorage);
    document.addEventListener('visibilitychange', syncDraftFromStorage);

    return () => {
      window.removeEventListener('pageshow', syncDraftFromStorage);
      window.removeEventListener(REGISTER_FORM_DRAFT_UPDATED_EVENT, syncDraftFromStorage);
      document.removeEventListener('visibilitychange', syncDraftFromStorage);
    };
  }, [mode]);

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
    saveRegisterFormDraft(form);

    await push({
      pathname: route.roleConversion.kindergartenRegister.address.root,
    });
  };

  const handleClearAddress = () => {
    setForm((prev) => {
      const next = { ...prev, address: '' };

      if (mode === 'manual') {
        saveRegisterFormDraft(next);
      }

      return next;
    });
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
    handleNextClick,
  };
}

export { useKindergartenRegisterPage };
