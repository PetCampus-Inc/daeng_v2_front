'use client';

import Image from 'next/image';

import { ActionButton } from '@knockdog/ui';

import { useResultPage } from '@views/role-conversion/complete/model/useRoleConversionResultPage';

function RoleConversionResultPage() {
  const { content, isPrimaryDisabled, handlePrimaryClick, handleSecondaryClick } = useResultPage();

  return (
    <div className='flex h-full flex-col items-center justify-center px-4'>
      <div className='flex w-full flex-col items-center'>
        <div className='flex justify-center py-2'>
          <Image src={content.imageSrc} alt={content.imageAlt} width={200} height={200} />
        </div>

        <div className='flex flex-col items-center gap-1 px-4 py-2 text-center'>
          <h1 className='h2-extrabold text-text-primary'>
            {content.titleLines.map((line, index) => (
              <span key={line}>
                {index > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </h1>
          <div className='body1-regular text-text-primary'>
            {content.descriptionLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>

        <div className='flex w-full flex-col items-center gap-2 p-4'>
          <ActionButton
            type='button'
            variant='primaryFill'
            size='large'
            className='w-full'
            disabled={isPrimaryDisabled}
            onClick={handlePrimaryClick}
          >
            {content.primaryButtonLabel}
          </ActionButton>

          <button
            type='button'
            onClick={handleSecondaryClick}
            className='label-semibold text-text-secondary px-2 py-1 underline'
          >
            {content.secondaryButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export { RoleConversionResultPage };
