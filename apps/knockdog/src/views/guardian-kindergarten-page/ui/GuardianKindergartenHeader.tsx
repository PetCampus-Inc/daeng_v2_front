'use client';

import { overlay } from 'overlay-kit';
import { Icon } from '@knockdog/ui';

import { guardianKindergartenApprovedContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenApprovedContent';
import { guardianKindergartenAttendingContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenAttendingContent';
import { guardianKindergartenEmptyContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenEmptyContent';
import { guardianKindergartenNoPetContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenNoPetContent';
import { guardianKindergartenPendingContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenPendingContent';
import { formatKoreanAmPmTime } from '@views/guardian-kindergarten-page/lib/formatGuardianAttendance';
import type { GuardianKindergartenConnectionStatus } from '@views/guardian-kindergarten-page/model/guardianKindergartenConnection';
import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';

import { route } from '@shared/constants/route';
import { useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { DogProfileAvatar } from '@shared/ui/dog-profile-avatar';

import { GuardianDogSelectSheet } from './GuardianDogSelectSheet';

interface GuardianKindergartenHeaderProps {
  status: GuardianKindergartenConnectionStatus;
  isAttending?: boolean;
  isDismissed?: boolean;
  checkInAt?: Date | null;
  checkOutAt?: Date | null;
  hasUnreadAlarm?: boolean;
  /** 등록된 강아지가 없을 때(로그인 직후 미등록) */
  hasNoPet?: boolean;
}

function getHeaderStatus(
  status: GuardianKindergartenConnectionStatus,
  isAttending: boolean,
  isDismissed: boolean,
  checkInAt: Date | null,
  checkOutAt: Date | null
) {
  if (isDismissed && checkInAt && checkOutAt) {
    return (
      <span className='gap-x2 flex items-center'>
        <span className='caption1-regular text-text-primary-inverse'>
          {guardianKindergartenAttendingContent.checkInLabel}
        </span>
        <span className='body2-bold text-text-primary-inverse'>{formatKoreanAmPmTime(checkInAt)}</span>
        <span className='caption1-regular text-text-primary-inverse'>|</span>
        <span className='caption1-regular text-text-primary-inverse'>
          {guardianKindergartenAttendingContent.checkOutLabel}
        </span>
        <span className='body2-bold text-text-primary-inverse'>{formatKoreanAmPmTime(checkOutAt)}</span>
      </span>
    );
  }

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
  // none / disconnected
  return guardianKindergartenEmptyContent.headerStatus;
}

function GuardianKindergartenHeader({
  status,
  isAttending = false,
  isDismissed = false,
  checkInAt = null,
  checkOutAt = null,
  hasUnreadAlarm = false,
  hasNoPet = false,
}: GuardianKindergartenHeaderProps) {
  const { push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const { pets, selectedPet, selectedPetId, setSelectedPetId } = useGuardianSelectedPet();

  const petName = selectedPet?.name ?? '';
  const petImageUrl = selectedPet?.profileImage;
  const useCompactStatus = isAttending || isDismissed;

  const handlePetSelectClick = () => {
    if (hasNoPet) return;

    overlay.open(({ isOpen, close }) => (
      <GuardianDogSelectSheet
        isOpen={isOpen}
        close={close}
        dogs={pets}
        currentPetId={selectedPetId}
        onSelect={(petId) => {
          setSelectedPetId(petId);
          // 이전 강아지 알림장 리스트/스택이 뒤로가기에 남지 않게 유치원 홈으로 정리
          navigateToTab('/compare').catch(() => undefined);
        }}
      />
    ));
  };

  const handleNotificationClick = () => {
    push({ pathname: route.notification.root });
  };

  return (
    <div className='relative pt-(--safe-area-inset-top,0px)'>
      <div className='px-x4 flex items-start justify-between py-5'>
        {hasNoPet ? (
          <div className='gap-x4 flex items-center'>
            <DogProfileAvatar
              name={guardianKindergartenNoPetContent.headerTitle}
              className='size-[52px]'
              pawClassName='text-fill-secondary-300'
            />
            <span className='h3-extrabold text-text-primary-inverse'>
              {guardianKindergartenNoPetContent.headerTitle}
            </span>
          </div>
        ) : (
          <button type='button' className='gap-x4 flex items-center text-left' onClick={handlePetSelectClick}>
            <DogProfileAvatar
              name={petName || '강아지'}
              imageUrl={petImageUrl?.trim() ? petImageUrl : undefined}
              className='size-[52px]'
              pawClassName='text-fill-secondary-300'
            />

            <div className='gap-x1 flex flex-col items-start justify-center'>
              <div className='gap-x1 flex items-center'>
                <span className='h3-extrabold text-text-primary-inverse'>{petName}</span>
                <Icon icon='ChevronBottom' className='text-text-primary-inverse size-6' aria-hidden='true' />
              </div>
              <div className={useCompactStatus ? undefined : 'body2-bold text-text-primary-inverse'}>
                {getHeaderStatus(status, isAttending, isDismissed, checkInAt, checkOutAt)}
              </div>
            </div>
          </button>
        )}

        <button
          type='button'
          onClick={handleNotificationClick}
          aria-label='알림함'
          className='bg-bg-0 shrink-0 rounded-full p-1.5'
        >
          {hasUnreadAlarm ? (
            <Icon icon='AlarmLineActive' className='text-fill-primary-500 size-6' aria-hidden='true' />
          ) : (
            <Icon icon='AlarmNone' className='text-fill-primary-500 size-6' aria-hidden='true' />
          )}
        </button>
      </div>
    </div>
  );
}

export { GuardianKindergartenHeader };
