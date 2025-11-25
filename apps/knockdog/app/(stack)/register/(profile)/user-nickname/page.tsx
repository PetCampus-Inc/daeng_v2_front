import { UserNicknamePage } from '@views/register/user-nickname';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <UserNicknamePage />
    </Suspense>
  );
}
