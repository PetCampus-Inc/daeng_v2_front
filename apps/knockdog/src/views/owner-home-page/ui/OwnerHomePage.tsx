'use client';

import Image from 'next/image';
import { Icon } from '@knockdog/ui';

import { useOwnerHomePage } from '@views/owner-home-page/model/useOwnerHomePage';
import { OwnerApprovalBanner } from '@views/owner-home-page/ui/OwnerApprovalBanner';
import { OwnerNoticebookStatus } from '@views/owner-home-page/ui/OwnerNoticebookStatus';
import { OwnerTodaySummaryCard } from '@views/owner-home-page/ui/OwnerTodaySummaryCard';

import { Header } from '@widgets/Header';

function OwnerHomePage() {
  const {
    approval,
    displaySchoolName,
    handleApprovalBannerClick,
    handleApprovalBannerClose,
    handleFriendPreviewClick,
    handleNoticebookStatusClick,
    handleRefresh,
    noticebook,
    shouldShowApprovalBanner,
    today,
  } = useOwnerHomePage();
  const shouldShowFriendPreview = !today.isError && today.enrolledCount > 0;

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
          pendingCount={approval.pendingCount}
          onClick={handleApprovalBannerClick}
          onClose={handleApprovalBannerClose}
        />
      ) : null}

      <section className='flex w-full flex-col gap-5 py-5'>
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
            onClick={handleRefresh}
          >
            <Icon icon='Reset' className='text-fill-secondary-700 size-6' />
          </button>
        </div>
        <OwnerTodaySummaryCard
          dateLabel={today.dateLabel}
          dayLabel={today.dayLabel}
          currentTimeLabel={today.currentTimeLabel}
          isError={today.isError}
          enrolledCount={today.enrolledCount}
          arrivalCount={today.arrivalCount}
          departureCount={today.departureCount}
          friends={today.friends}
          extraFriendCount={today.extraFriendCount}
          onFriendPreviewClick={handleFriendPreviewClick}
        />
        {noticebook.shouldShow ? (
          <OwnerNoticebookStatus
            pendingCount={noticebook.pendingCount}
            sentCount={noticebook.sentCount}
            onClick={handleNoticebookStatusClick}
          />
        ) : null}
      </section>
    </div>
  );
}

export { OwnerHomePage };
