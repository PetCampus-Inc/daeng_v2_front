'use client';

import Image from 'next/image';
import { overlay } from 'overlay-kit';
import { Icon } from '@knockdog/ui';

import { useOwnerHomePage } from '@views/owner-home-page/model/useOwnerHomePage';
import { OwnerHomeDashboardCard } from '@views/owner-home-page/ui/OwnerHomeDashboardCard';
import { OwnerHomeOperationGuideBanner } from '@views/owner-home-page/ui/OwnerHomeOperationGuideBanner';
import { OwnerHomeQuickMenu } from '@views/owner-home-page/ui/OwnerHomeQuickMenu';
import { OwnerMembersInviteSheet } from '@views/owner-members-page/ui/OwnerMembersInviteSheet';

import { Header } from '@widgets/Header';
import { useHasUnreadNotificationQuery } from '@entities/notification';
import { useUserStore } from '@entities/user';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { PullToRefresh } from '@shared/ui/pull-to-refresh';

function OwnerHomePage() {
  const { push } = useStackNavigation();
  const userId = useUserStore((state) => state.user?.userId);
  const { data: hasUnreadNotification = false } = useHasUnreadNotificationQuery({ userId, enabled: true });
  const {
    displaySchoolName,
    handleAlbumClick,
    handleArrivalClick,
    handleConnectionClick,
    handleDepartureClick,
    handleEnrolledClick,
    handleNewsClick,
    handleNoticebookStatusClick,
    handleRefresh,
    hasConnectedMembers,
    noticebook,
    ownerDisplayName,
    pendingConnectionCount,
    today,
  } = useOwnerHomePage();

  const handleInviteClick = () => {
    overlay.open(({ isOpen, close }) => <OwnerMembersInviteSheet isOpen={isOpen} close={close} />);
  };

  return (
    <div data-testid='owner-home-root' className='bg-bg-50 flex h-dvh flex-col'>
      <div className='bg-bg-0 pt-(--safe-area-inset-top,0px)'>
        <Header>
          <Header.Title className='flex items-center'>
            <Image src='/images/img_logo_text2.png' alt='똑독' width={48} height={26} priority />
          </Header.Title>
          <Header.RightSection>
            <button type='button' aria-label='알림함' onClick={() => push({ pathname: route.notification.root })}>
              <Icon
                icon={hasUnreadNotification ? 'AlarmLineActive' : 'AlarmNone'}
                className='size-6 text-text-primary'
              />
            </button>
          </Header.RightSection>
        </Header>
      </div>

      <PullToRefresh onRefresh={() => handleRefresh()}>
        <section className='flex w-full flex-col gap-5 px-4 py-5'>
          <div className='flex w-full items-center gap-1'>
            <Icon icon='Kindergarten' className='text-fill-primary-500 size-6 shrink-0' />
            <h1
              data-testid='owner-home-school-name'
              className='h2-extrabold text-text-primary min-w-0 flex-1 truncate'
            >
              {displaySchoolName}
            </h1>
          </div>

          <OwnerHomeDashboardCard
            dateLabel={today.dateLabel}
            dayLabel={today.dayLabel}
            ownerDisplayName={ownerDisplayName}
            isError={today.isError}
            hasConnectedMembers={hasConnectedMembers}
            enrolledCount={today.enrolledCount}
            arrivalCount={today.arrivalCount}
            departureCount={today.departureCount}
            noticebookPendingCount={noticebook.pendingCount}
            noticebookSentCount={noticebook.sentCount}
            shouldShowNoticebook={noticebook.shouldShow}
            onEnrolledClick={handleEnrolledClick}
            onArrivalClick={handleArrivalClick}
            onDepartureClick={handleDepartureClick}
            onNoticebookClick={handleNoticebookStatusClick}
          />

          <OwnerHomeQuickMenu
            pendingConnectionCount={pendingConnectionCount}
            onConnectionClick={handleConnectionClick}
            onAlbumClick={handleAlbumClick}
            onNewsClick={handleNewsClick}
            onInviteClick={handleInviteClick}
          />

          {!hasConnectedMembers ? <OwnerHomeOperationGuideBanner /> : null}
        </section>
      </PullToRefresh>
    </div>
  );
}

export { OwnerHomePage };
