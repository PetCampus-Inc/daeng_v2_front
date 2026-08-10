'use client';

import Image from 'next/image';

import { ActionButton } from '@knockdog/ui';

import { SafeArea } from '@shared/ui/safe-area';

import { GUARDIAN_INVITE_RESULT_STATUS } from '../config/guardianInviteResultStatus';
import { useGuardianInviteResultPage } from '../model/useGuardianInviteResultPage';

function GuardianInviteResultPage() {
  const { content, failedPets, handlePrimaryClick, handleSecondaryClick, status } = useGuardianInviteResultPage();
  const isApplicationFailed = status === GUARDIAN_INVITE_RESULT_STATUS.APPLICATION_FAILED;
  const actionButtons = (
    <div className='flex gap-2'>
      {content.secondaryButtonLabel ? (
        <ActionButton type='button' variant='secondaryLine' size='large' className='flex-1' onClick={handleSecondaryClick}>
          {content.secondaryButtonLabel}
        </ActionButton>
      ) : null}
      <ActionButton type='button' size='large' className='flex-1' onClick={handlePrimaryClick}>
        {content.primaryButtonLabel}
      </ActionButton>
    </div>
  );

  return (
    <SafeArea edges={['bottom']} className='bg-bg-0 flex h-dvh flex-col'>
      <main className='flex min-h-0 flex-1 items-center justify-center'>
        <section className={`flex w-full flex-col items-center ${isApplicationFailed ? 'gap-5' : ''}`}>
          <div className='flex w-full flex-col items-center gap-3'>
            <div className='flex h-[200px] items-center justify-center'>
              <Image src={content.imageSrc} alt={content.imageAlt} width={200} height={200} priority />
            </div>
            <div className='flex flex-col items-center gap-1 px-x4 text-center'>
              <h1 className='h2-extrabold text-text-primary'>{content.title}</h1>
              <p className='body1-regular text-text-primary'>{content.description}</p>
            </div>
          </div>

          {isApplicationFailed ? (
            <div className='w-full px-x4'>
              <div className='radius-r3 border-line-200 flex h-[124px] w-full items-center border p-x4'>
                <div className='flex w-full flex-col gap-3'>
                  <p className='body2-regular flex h-5 items-center gap-1 text-text-secondary'>
                    다시 연결할 강아지 <span className='body2-semibold text-text-accent'>{failedPets.length}마리</span>
                  </p>
                  <ul className='flex flex-wrap content-start items-start gap-2 overflow-hidden' aria-label='재신청할 강아지 목록'>
                    {failedPets.map((pet) => (
                      <li key={pet.id} className='caption1-semibold rounded-full bg-fill-secondary-50 px-2 py-1 text-text-primary'>
                        {pet.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}

          <div className='w-full p-x4'>{actionButtons}</div>
        </section>
      </main>
    </SafeArea>
  );
}

export { GuardianInviteResultPage };
