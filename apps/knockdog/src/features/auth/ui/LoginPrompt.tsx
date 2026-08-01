'use client';

import { ActionButton } from '@knockdog/ui';

import { useUserStore } from '@entities/user';
import { useStackNavigation } from '@shared/lib/bridge';

function LoginPrompt() {
  const { pushForResult } = useStackNavigation();

  const handleLogin = async () => {
    const loggedIn = await pushForResult<boolean>({ pathname: '/auth/login' }, 600_000);
    if (!loggedIn) return;

    // Stack WebView에서 저장된 USER를 마이페이지 탭 인메모리 store에 반영
    await useUserStore.persist.rehydrate();
  };

  return (
    <div className='px-4'>
      <div className='py-5'>
        <h1 className='h1-extrabold'>
          <strong className='text-text-accent'>로그인</strong>
          하면 더 편리하게 <br /> 이용할 수 있어요!
        </h1>
      </div>
      <div className='pt-3 pb-7'>
        <ActionButton variant='primaryFill' onClick={handleLogin}>
          로그인하기
        </ActionButton>
      </div>
    </div>
  );
}

export { LoginPrompt };
