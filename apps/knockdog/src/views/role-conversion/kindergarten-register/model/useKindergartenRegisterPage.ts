import { useState } from 'react';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

import {
  toKindergartenInfo,
  type KindergartenRegisterForm,
} from '@views/role-conversion/model/kindergartenInfo';
import { saveDraft } from '@views/role-conversion/model/kindergartenConfirmParams';

import { formatAddress, formatName, formatPhone } from '../lib/formatKindergartenRegisterField';

const fieldFormatters = {
  name: formatName,
  address: formatAddress,
  kindergartenNumber: formatPhone,
  ownerName: formatName,
  phoneNumber: formatPhone,
} as const;

function useKindergartenRegisterPage() {
  const { push } = useStackNavigation();
  const [form, setForm] = useState<KindergartenRegisterForm>({
    name: '',
    address: '',
    kindergartenNumber: '',
    ownerName: '',
    phoneNumber: '',
  });

  const handleFieldChange = (field: keyof KindergartenRegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: fieldFormatters[field](value) }));
  };

  const isNextEnabled = Object.values(form).every((value) => value.trim().length > 0);

  const handleNextClick = () => {
    const kindergarten = toKindergartenInfo(form);

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
