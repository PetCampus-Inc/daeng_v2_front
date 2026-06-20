import { useState } from 'react';

interface KindergartenRegisterForm {
  name: string;
  address: string;
  kindergartenNumber: string;
  phoneNumber: string;
}

function useKindergartenRegisterPage() {
  const [form, setForm] = useState<KindergartenRegisterForm>({
    name: '',
    address: '',
    kindergartenNumber: '',
    phoneNumber: '',
  });

  const handleFieldChange = (field: keyof KindergartenRegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isNextEnabled = Object.values(form).every((value) => value.trim().length > 0);

  const handleNextClick = () => {
    // @todo 3단계 개인정보 수집 및 이용 동의 라우팅(26/06/20)
  };

  return {
    form,
    isNextEnabled,
    handleFieldChange,
    handleNextClick,
  };
}

export { useKindergartenRegisterPage };
