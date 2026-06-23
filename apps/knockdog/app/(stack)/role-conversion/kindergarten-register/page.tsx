'use client';

import { useSearchParams } from 'next/navigation';

import { KindergartenRegisterPage } from '@views/role-conversion/kindergarten-register';
import type { KindergartenRegisterSource } from '@views/role-conversion/model/kindergartenInfo';

export default function Page() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get('mode') ?? 'manual') as KindergartenRegisterSource;
  const resetKey = searchParams.get('reset') ?? 'default';

  return <KindergartenRegisterPage key={`${mode}-${resetKey}`} mode={mode} />;
}
