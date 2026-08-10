'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { GuardianProfileFormValues } from '@features/guardian-profile-form';

const initialGuardianProfileValues: GuardianProfileFormValues = {
  name: '',
  gender: null,
  phoneNumber: '',
  address: '',
  addressDetail: '',
  emergencyPhoneNumber: '',
};

interface GuardianInviteFlowContextValue {
  guardianProfileValues: GuardianProfileFormValues;
  setGuardianProfileValues: (values: GuardianProfileFormValues) => void;
}

const GuardianInviteFlowContext = createContext<GuardianInviteFlowContextValue | null>(null);

function GuardianInviteFlowProvider({ children }: { children: ReactNode }) {
  const [guardianProfileValues, setGuardianProfileValues] = useState<GuardianProfileFormValues>(
    initialGuardianProfileValues
  );
  const value = useMemo(
    () => ({ guardianProfileValues, setGuardianProfileValues }),
    [guardianProfileValues]
  );

  return <GuardianInviteFlowContext.Provider value={value}>{children}</GuardianInviteFlowContext.Provider>;
}

function useGuardianInviteFlow() {
  const context = useContext(GuardianInviteFlowContext);

  if (!context) {
    throw new Error('GuardianInviteFlowProvider 내부에서만 사용할 수 있습니다.');
  }

  return context;
}

export { GuardianInviteFlowProvider, useGuardianInviteFlow };
