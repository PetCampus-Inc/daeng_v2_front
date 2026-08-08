'use client';

import { Icon } from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { guardianKindergartenApprovedContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenApprovedContent';
import { guardianKindergartenAttendingContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenAttendingContent';
import { guardianKindergartenEmptyContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenEmptyContent';
import { guardianKindergartenPendingContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenPendingContent';
import { formatKoreanAmPmTime } from '@views/guardian-kindergarten-page/lib/formatGuardianAttendance';
import type { GuardianKindergartenConnectionStatus } from '@views/guardian-kindergarten-page/model/guardianKindergartenConnection';
import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';

import { DogProfileAvatar } from '@shared/ui/dog-profile-avatar';

import { GuardianDogSelectSheet } from './GuardianDogSelectSheet';

interface GuardianKindergartenHeaderProps {
  status: GuardianKindergartenConnectionStatus;
  isAttending?: boolean;
  checkInAt?: Date | null;
  hasUnreadAlarm?: boolean;
}

function getHeaderStatus(
  status: GuardianKindergartenConnectionStatus,
  isAttending: boolean,
  checkInAt: Date | null
) {
  if (isAttending && checkInAt) {
    return (
      <span className='gap-x2 flex items-center'>
        <span className='caption1-regular text-text-primary-inverse'>
          {guardianKindergartenAttendingContent.checkInLabel}
        </span>
        <span className='body2-bold text-text-primary-inverse'>{formatKoreanAmPmTime(checkInAt)}</span>
      </span>
    );
  }
  if (status === 'approved') return guardianKindergartenApprovedContent.headerStatus;
  if (status === 'pending') return guardianKindergartenPendingContent.headerStatus;
  return guardianKindergartenEmptyContent.headerStatus;
}

function GuardianKindergartenHeader({
  status,
  isAttending = false,
  checkInAt = null,
  hasUnreadAlarm = false,
}: GuardianKindergartenHeaderProps) {
  const { pets, selectedPet, selectedPetId, setSelectedPetId, getPetConnectionStatus } =
    useGuardianSelectedPet();

  const petName = selectedPet?.name ?? '';
  const petImageUrl = selectedPet?.profileImage;

  const handlePetSelectClick = () => {
    overlay.open(({ isOpen, close }) => (
      <GuardianDogSelectSheet
        isOpen={isOpen}
        close={close}
        dogs={pets}
        currentPetId={selectedPetId}
        getPetConnectionStatus={getPetConnectionStatus}
        onSelect={setSelectedPetId}
      />
    ));
  };

  return (
    <div className='relative pt-(--safe-area-inset-top,0px)'>
      <div className='px-x4 flex items-start justify-between py-5'>
        <button type='button' className='gap-x4 flex items-center text-left' onClick={handlePetSelectClick}>
          <DogProfileAvatar name={petName || '강아지'} imageUrl={petImageUrl} className='size-[52px]' />

          <div className='gap-x1 flex flex-col items-start justify-center'>
            <div className='gap-x1 flex items-center'>
              <span className='h3-extrabold text-text-primary-inverse'>{petName}</span>
              <Icon icon='ChevronBottom' className='text-text-primary-inverse size-6' aria-hidden='true' />
            </div>
            <div className={isAttending ? undefined : 'body2-bold text-text-primary-inverse'}>
              {getHeaderStatus(status, isAttending, checkInAt)}
            </div>
          </div>
        </button>

        <div className='bg-bg-0 shrink-0 rounded-full p-1.5' aria-hidden='true'>
          {hasUnreadAlarm ? (
            <Icon icon='AlarmLineActive' className='text-fill-primary-500 size-6' />
          ) : (
            <Icon icon='AlarmNone' className='text-fill-primary-500 size-6' />
          )}
        </div>
      </div>
    </div>
  );
}

export { GuardianKindergartenHeader };
