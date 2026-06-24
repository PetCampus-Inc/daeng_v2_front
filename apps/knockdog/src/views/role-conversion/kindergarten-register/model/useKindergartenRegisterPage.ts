import { useMemo, useState } from 'react';

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

import { formatAddress, formatName, formatPhone } from '@views/role-conversion/kindergarten-register/lib/formatKindergartenRegisterField';

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
  if (mode !== 'search') {
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

  const isNextEnabled = useMemo(
    () => requiredFields.every((field) => form[field].trim().length > 0),
    [form]
  );

  const handleFieldChange = (field: keyof KindergartenRegisterForm, value: string) => {
    if (field === 'source' || field === 'placeId') return;

    setForm((prev) => ({ ...prev, [field]: fieldFormatters[field](value) }));
  };

  const handleNextClick = () => {
    const kindergarten = toKindergartenInfo(form);

    if (kindergarten.source === 'manual') {
      clearSearchPrefill();
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
    handleFieldChange,
    handleNextClick,
  };
}

export { useKindergartenRegisterPage };
