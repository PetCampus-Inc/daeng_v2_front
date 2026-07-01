'use client';

import { Icon } from '@knockdog/ui';
import { useLogin } from '../model/useLogin';

interface GuestLoginButtonProps {
  redirectTo?: string;
}

function GuestLoginButton({ redirectTo }: GuestLoginButtonProps) {
  const { guestLogin } = useLogin({ redirectTo });

  return (
    <button className='label-semibold flex items-center justify-center gap-x-1 text-center' onClick={guestLogin}>
      게스트로 둘러보기
      <Icon icon='ChevronRight' className='h-4 w-4' />
    </button>
  );
}

export { GuestLoginButton };
export type { GuestLoginButtonProps };
