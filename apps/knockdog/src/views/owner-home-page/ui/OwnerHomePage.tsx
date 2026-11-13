'use client';

import Image from 'next/image';
import { overlay } from 'overlay-kit';
import { Icon } from '@knockdog/ui';

import { useOwnerHomePage } from '@views/owner-home-page/model/useOwnerHomePage';
import { OwnerHomeStatusCard } from '@views/owner-home-page/ui/OwnerHomeStatusCard';
import { OwnerHomeTaskCards } from '@views/owner-home-page/ui/OwnerHomeTaskCards';
import { OwnerApprovalBanner } from '@views/owner-home-page/ui/OwnerApprovalBanner';
import { OwnerHomeDataState } from '@views/owner-home-page/ui/OwnerHomeDataState';
import { OwnerMembersInviteSheet } from '@views/owner-members-page/ui/OwnerMembersInviteSheet';
import { Header } from '@widgets/Header';
import { useHomeBannerDismiss } from '@entities/owner-home';
import { useHasUnreadNotificationQuery } from '@entities/notification';
import { useUserStore } from '@entities/user';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { NotificationBell } from '@shared/ui/notification-bell';
import { PullToRefresh } from '@shared/ui/pull-to-refresh';
import { toast, COMMON_ERROR_TOAST_MESSAGE } from '@shared/ui/toast';

const OwnerHomePage = () => {
  const { push } = useStackNavigation();
  const userId = useUserStore((state) => state.user?.userId);
  const { data: hasUnreadNotification = false } = useHasUnreadNotificationQuery({
    userId,
    audience: 'OWNER',
    enabled: true,
  });
  const home = useOwnerHomePage();
  const dismissBanner = useHomeBannerDismiss(userId);
  const handleInviteClick = () => {
    overlay.open(({ isOpen, close }) => <OwnerMembersInviteSheet isOpen={isOpen} close={close} />);
  };
  const handleBannerClose = () => {
    const latestId = home.pendingApprovals?.latestId;
    if (latestId == null || dismissBanner.isPending) return;
    dismissBanner.mutate(latestId, { onError: () => toast({ title: COMMON_ERROR_TOAST_MESSAGE }) });
  };
  const homeState =
    home.isHomeLoading || home.today.isError ? (
      <OwnerHomeDataState
        isLoading={home.isHomeLoading}
        isRetrying={home.isHomeFetching}
        onRetry={home.handleHomeRetry}
      />
    ) : undefined;
  const ticketsState =
    home.isMembersLoading || home.isMembersError ? (
      <OwnerHomeDataState
        isLoading={home.isMembersLoading}
        isRetrying={home.isMembersFetching}
        onRetry={home.handleMembersRetry}
      />
    ) : undefined;

  return (
    <div data-testid='owner-home-root' className='bg-bg-50 flex min-h-0 flex-1 flex-col'>
      <div className='bg-bg-0 shrink-0 rounded-b-[24px] pt-(--safe-area-inset-top,0px)'>
        <Header className='pl-x7 pr-x4 h-[66px] border-0' innerClassName='h-[66px]'>
          <Header.Title className='flex items-center'>
            <Image src='/images/img_logo_text2.png' alt='똑독' width={48} height={26} priority />
          </Header.Title>
          <Header.RightSection>
            <button type='button' aria-label='보호자 초대 QR' onClick={handleInviteClick}>
              <Icon icon='Qr' className='text-text-primary size-x6' />
            </button>
            <NotificationBell
              hasUnread={hasUnreadNotification}
              onClick={() => push({ pathname: route.notification.root })}
            />
          </Header.RightSection>
        </Header>
        <h1 data-testid='owner-home-school-name' className='h3-extrabold text-text-primary px-x6 py-x5 truncate'>
          {home.displaySchoolName}
        </h1>
      </div>
      <PullToRefresh onRefresh={() => home.handleRefresh()}>
        <div className='gap-x6 px-x3 pt-x5 flex w-full flex-col pb-[calc(var(--bottom-bar-height)+20px)]'>
          {!home.isHomeLoading && !home.today.isError && home.pendingApprovals?.bannerVisible ? (
            <OwnerApprovalBanner
              onClick={home.handleConnectionClick}
              onClose={handleBannerClose}
              isClosing={dismissBanner.isPending}
            />
          ) : null}
          {homeState ?? (
            <OwnerHomeStatusCard
              dateLabel={home.homeDateLabel}
              currentlyInCount={home.today.enrolledCount}
              checkedInCount={home.today.arrivalCount}
              absentCount={home.today.absentCount}
              checkedOutCount={home.today.departureCount}
              lateCount={home.latePets.count}
              latePets={home.latePets.items}
              onLatePetsClick={home.handleLatePetsClick}
            />
          )}
          <OwnerHomeTaskCards
            unsentCount={home.noticebook.pendingCount}
            expiringCount={home.expiringCount}
            noticebookState={homeState}
            ticketsState={ticketsState}
            onNoticebookClick={home.handleNoticebookStatusClick}
            onNewsClick={home.handleNewsClick}
            onTicketsClick={home.handleTicketsClick}
          />
        </div>
      </PullToRefresh>
    </div>
  );
};

export { OwnerHomePage };
