'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Icon } from '@knockdog/ui';
import { OwnerApprovalBanner } from '@views/owner-home-page/ui/OwnerApprovalBanner';
import { OwnerNoticebookStatus } from '@views/owner-home-page/ui/OwnerNoticebookStatus';
import { OwnerTodaySummaryCard } from '@views/owner-home-page/ui/OwnerTodaySummaryCard';
import { Header } from '@widgets/Header';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

const ownerHomeMock = {
  schoolName: '모모네 유치원',
  approvalPendingCount: 3,
  today: {
    dateLabel: '6월 18일',
    dayLabel: '(화)',
    currentTimeLabel: '오후 8:00',
    enrolledCount: 1,
    arrivalCount: 12,
    departureCount: 12,
    friends: [
      { id: 'momo', name: '모모' },
      { id: 'coco', name: '코코' },
      { id: 'bomi', name: '보미' },
      { id: 'dubu', name: '두부' },
      { id: 'choco', name: '초코' },
    ],
    extraFriendCount: 3,
  },
  noticebook: {
    pendingCount: 7,
    sentCount: 12,
  },
};

const SCHOOL_NAME_MAX_LENGTH = 15;

function formatSchoolName(name: string) {
  const characters = Array.from(name);

  if (characters.length <= SCHOOL_NAME_MAX_LENGTH) return name;

  return `${characters.slice(0, SCHOOL_NAME_MAX_LENGTH).join('')}···`;
}

function OwnerHomePage() {
  const { schoolName, approvalPendingCount, today, noticebook } = ownerHomeMock;
  const { push } = useStackNavigation();
  const [dismissedApprovalCount, setDismissedApprovalCount] = useState<number | null>(null);
  const shouldShowApprovalBanner = approvalPendingCount > 0 && dismissedApprovalCount !== approvalPendingCount;
  const displaySchoolName = formatSchoolName(schoolName);

  return (
    <div className='bg-bg-50 flex h-dvh flex-col'>
      <div className='bg-bg-0 pt-(--safe-area-inset-top,0px)'>
        <Header>
          <Header.Title className='flex items-center'>
            <Image src='/images/img_logo_text2.png' alt='똑독' width={48} height={26} priority />
          </Header.Title>
        </Header>
      </div>
      {shouldShowApprovalBanner ? (
        <OwnerApprovalBanner
          pendingCount={approvalPendingCount}
          onClick={() => push({ pathname: route.owner.members.approval.root })}
          onClose={() => setDismissedApprovalCount(approvalPendingCount)}
        />
      ) : null}

      <section className={`flex ${today.enrolledCount > 0 ? 'h-[433px]' : 'h-[393px]'} w-full flex-col gap-5 py-5`}>
        <div className='flex h-[52px] w-full items-center justify-between gap-5 px-4'>
          <div className='flex min-w-0 flex-1 gap-1'>
            <p className='h3-extrabold text-text-primary min-w-0 w-fit'>
              안녕하세요
              <br />
              <span className='text-text-accent'>{displaySchoolName}</span> 원장님
            </p>
            <div className='flex h-12 w-6 shrink-0 items-center justify-center pt-6'>
              <Icon icon='Kindergarten' className='text-fill-secondary-700 size-6 shrink-0' />
            </div>
          </div>
          <button
            type='button'
            className='bg-bg-100 radius-full flex size-9 shrink-0 items-center justify-center p-1.5'
            aria-label='새로고침'
          >
            <Icon icon='Reset' className='text-fill-secondary-700 size-6' />
          </button>
        </div>
        <OwnerTodaySummaryCard
          dateLabel={today.dateLabel}
          dayLabel={today.dayLabel}
          currentTimeLabel={today.currentTimeLabel}
          enrolledCount={today.enrolledCount}
          arrivalCount={today.arrivalCount}
          departureCount={today.departureCount}
          friends={today.friends}
          extraFriendCount={today.extraFriendCount}
        />
        <OwnerNoticebookStatus pendingCount={noticebook.pendingCount} sentCount={noticebook.sentCount} />
      </section>
    </div>
  );
}

export { OwnerHomePage };
