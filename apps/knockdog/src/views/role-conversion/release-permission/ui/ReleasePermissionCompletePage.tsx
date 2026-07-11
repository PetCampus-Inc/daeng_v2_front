'use client';

import Image from 'next/image';

import { ActionButton } from '@knockdog/ui';

import { releasePermissionContent } from '@views/role-conversion/release-permission/config/releasePermissionContent';

import { Header } from '@widgets/Header';
import { useStackNavigation } from '@shared/lib/bridge';
import { route } from '@shared/constants/route';

function ReleasePermissionCompletePage() {
  const { reset } = useStackNavigation();

  const handleGoHome = () => {
    // @todo 보호자 홈 화면 구현 후 해당 경로로 이동 (현재 미구현으로 임시 마이페이지 이동)
    reset(route.mypage.root);
  };

  return (
    <div className='flex h-full flex-col'>
      <Header>
        <Header.CloseButton onClick={handleGoHome} />
        <Header.Title>{releasePermissionContent.headerTitle}</Header.Title>
      </Header>

      <div className='flex min-h-0 flex-1 flex-col gap-10 px-4 py-5'>
        <h1 className='h1-extrabold text-text-primary'>
          {releasePermissionContent.completeTitleLine1}
          <br />
          {releasePermissionContent.completeTitleLine2}
        </h1>

        <div className='flex justify-center'>
          <Image
            src={releasePermissionContent.completeImageSrc}
            alt={releasePermissionContent.completeImageAlt}
            width={200}
            height={200}
          />
        </div>
      </div>

      <div className='shrink-0 px-4 py-5'>
        <ActionButton
          type='button'
          variant='secondaryFill'
          size='large'
          className='w-full'
          onClick={handleGoHome}
        >
          {releasePermissionContent.completeHomeButtonLabel}
        </ActionButton>
      </div>
    </div>
  );
}

export { ReleasePermissionCompletePage };
