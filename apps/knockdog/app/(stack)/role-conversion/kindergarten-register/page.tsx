'use client';

import { useSearchParams } from 'next/navigation';

import { KindergartenRegisterPage } from '@views/role-conversion/kindergarten-register';

export default function Page() {
  const searchParams = useSearchParams();
  const resetKey = searchParams.get('reset') ?? 'default';

  return <KindergartenRegisterPage key={resetKey} />;
}
