'use client';

import Image from 'next/image';

import { ActionButton } from '@knockdog/ui';

import { Header } from '@widgets/Header';
import { useStackNavigation } from '@shared/lib/bridge';
import { route } from '@shared/constants/route';

import { releasePermissionContent } from '@views/role-conversion/release-permission/config/releasePermissionContent';

function ReleasePermissionPage() {
  const { back, push } = useStackNavigation();

  const handleCancel = () => {
    back();
  };

  const handleConfirm = () => {
    push({ pathname: route.roleConversion.releasePermission.reason.root });
  };

  return (
    <div className='flex h-full flex-col'>
      <Header>
        <Header.BackButton />
        <Header.Title>{releasePermissionContent.headerTitle}</Header.Title>
      </Header>

      <div className='flex min-h-0 flex-1 flex-col items-center justify-center px-4'>
        <Image
          src={releasePermissionContent.imageSrc}
          alt={releasePermissionContent.imageAlt}
          width={230}
          height={230}
        />

        <div className='flex flex-col items-center gap-1 pt-9 text-center'>
          <h1 className='h1-extrabold text-text-primary'>{releasePermissionContent.title}</h1>
          <div className='body1-regular text-text-primary'>
            <p>{releasePermissionContent.descriptionLine1}</p>
            <p>{releasePermissionContent.descriptionLine2}</p>
          </div>
        </div>
      </div>

      <div className='shrink-0 flex gap-2 px-4 py-5'>
        <ActionButton
          type='button'
          variant='secondaryLine'
          size='large'
          className='flex-1'
          onClick={handleCancel}
        >
          {releasePermissionContent.cancelButtonLabel}
        </ActionButton>
        <ActionButton
          type='button'
          variant='secondaryFill'
          size='large'
          className='flex-1'
          onClick={handleConfirm}
        >
          {releasePermissionContent.confirmButtonLabel}
        </ActionButton>
      </div>
    </div>
  );
}

export { ReleasePermissionPage };
