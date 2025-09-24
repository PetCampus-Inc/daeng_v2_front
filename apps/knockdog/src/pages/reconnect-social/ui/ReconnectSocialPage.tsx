'use client';

import { redirect, useRouter } from 'next/navigation';
import { ActionButton } from '@knockdog/ui';
import { Header } from '@widgets/Header';
import { useSocialUserStore } from '@entities/social-user';
import { route } from '@shared/constants/route';

function ReconnectSocialPage() {
  const router = useRouter();
  const socialUser = useSocialUserStore((state) => state.socialUser);

  // 소셜 유저 정보가 없으면 로그인 페이지로 이동
  if (!socialUser) redirect(route.auth.login.root);

  const handleBackClick = () => router.back();
  const handleReconnectClick = () => router.push(route.auth.reconnectSocial.verifyEmail.root);

  return (
    <>
      <Header>
        <Header.BackButton />
        <Header.Title>계정 연동</Header.Title>
      </Header>

      <div className='h1-extrabold mt-10 flex h-full flex-col px-4 py-5'>
        <div className='flex-1'>
          <p className='h1-extrabold'>
            이메일 인증을 통해
            <br />
            기존 계정과 연동할 수 있어요
          </p>
          <p className='mt-8'>계정을 연동할까요?</p>

          <div className='bg-fill-secondary-50 body1-medium mt-8 flex flex-col rounded-lg p-4 text-center'>
            {socialUser.email}
          </div>
        </div>

        <div className='flex gap-2 py-5'>
          <ActionButton size='large' variant='secondaryLine' onClick={handleBackClick}>
            돌아가기
          </ActionButton>
          <ActionButton size='large' variant='secondaryFill' onClick={handleReconnectClick}>
            연동하기
          </ActionButton>
        </div>
      </div>
    </>
  );
}

export { ReconnectSocialPage };
