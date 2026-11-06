'use client';

import Image from 'next/image';

import { ActionButton } from '@knockdog/ui';

import { releasePermissionContent } from '@views/role-conversion/release-permission/config/releasePermissionContent';

import { Header } from '@widgets/Header';
import { useStackNavigation } from '@shared/lib/bridge';
import { route } from '@shared/constants/route';

function ReleasePermissionWithdrawPage() {
  const { push, reset } = useStackNavigation();

  const handleLater = () => {
    reset(route.mypage.root);
  };

  const handleContinue = () => {
    push({ pathname: '/withdraw/confirm' });
  };

  return (
    <div className='flex h-full flex-col'>
      <Header>
        <Header.CloseButton onClick={handleLater} />
        <Header.Title>{releasePermissionContent.withdrawHeaderTitle}</Header.Title>
      </Header>

      <div className='flex min-h-0 flex-1 flex-col gap-10 px-4 py-5'>
        <div className='flex flex-col gap-1'>
          <h1 className='h1-extrabold text-text-primary'>{releasePermissionContent.withdrawTitle}</h1>
          <div className='body1-regular text-text-primary'>
            <p>{releasePermissionContent.withdrawDescriptionLine1}</p>
            <p>{releasePermissionContent.withdrawDescriptionLine2}</p>
          </div>
        </div>

        <div className='flex justify-center'>
          <Image
            src={releasePermissionContent.withdrawImageSrc}
            alt={releasePermissionContent.withdrawImageAlt}
            width={230}
            height={230}
          />
        </div>
      </div>

      <div className='shrink-0 flex gap-2 px-4 py-5'>
        <ActionButton
          type='button'
          variant='secondaryLine'
          size='large'
          className='flex-1'
          onClick={handleLater}
        >
          {releasePermissionContent.withdrawLaterButtonLabel}
        </ActionButton>
        <ActionButton
          type='button'
          variant='secondaryFill'
          size='large'
          className='flex-1'
          onClick={handleContinue}
        >
          {releasePermissionContent.withdrawContinueButtonLabel}
        </ActionButton>
      </div>
    </div>
  );
}

export { ReleasePermissionWithdrawPage };
