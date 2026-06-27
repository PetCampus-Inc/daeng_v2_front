'use client';

import Image from 'next/image';

import { ActionButton } from '@knockdog/ui';

import { roleConversionCompleteContent } from '@views/role-conversion/complete/config/roleConversionCompleteContent';
import { useRoleConversionCompletePage } from '@views/role-conversion/complete/model/useRoleConversionCompletePage';

function RoleConversionCompletePage() {
  const { isInviteActive, handleInviteClick, handleSkipClick } = useRoleConversionCompletePage();

  return (
    <div className='flex h-full flex-col items-center justify-center px-4'>
      <div className='flex w-full flex-col items-center'>
        <div className='flex justify-center py-2'>
          <Image
            src={roleConversionCompleteContent.imageSrc}
            alt={roleConversionCompleteContent.imageAlt}
            width={200}
            height={200}
          />
        </div>

        <div className='flex flex-col items-center gap-1 px-4 py-2 text-center'>
          <h1 className='h2-extrabold text-text-primary'>{roleConversionCompleteContent.title}</h1>
          <p className='body1-regular text-text-primary'>{roleConversionCompleteContent.description}</p>
        </div>

        <div className='flex w-full flex-col items-center gap-2 p-4'>
          <ActionButton
            type='button'
            variant='primaryFill'
            size='large'
            className='w-full'
            data-active={isInviteActive ? true : undefined}
            aria-pressed={isInviteActive}
            onClick={handleInviteClick}
          >
            {roleConversionCompleteContent.inviteButtonLabel}
          </ActionButton>

          <button
            type='button'
            onClick={handleSkipClick}
            className='label-semibold text-text-secondary px-2 py-1 underline'
          >
            {roleConversionCompleteContent.skipButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export { RoleConversionCompletePage };
