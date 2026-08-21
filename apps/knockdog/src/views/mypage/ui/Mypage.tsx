'use client';

import { Divider, Icon, AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { Header } from '@widgets/Header';

import { SettingsSection } from '@features/app-settings';
import { LoginPrompt } from '@features/auth';
import { DogSelectSheet, DogHouseSection, NoDogPrompt } from '@features/dog-profile';
import {
  ownerMypageContent,
  OwnerKindergartenCard,
  OwnerProfileRow,
  OwnerVerificationEntry,
  RoleConversionButton,
  roleConversionButtonContent,
  useMypageRoleView,
  useOwnerKindergarten,
  useOwnerProfile,
  useOwnerMypageSummary,
  useOwnerRole,
} from '@features/role-conversion';
import { QuickActionsSection } from '@features/support';
import { AccountSection, type AccountInfo } from '@features/user-account';
import { usePetListQuery } from '@entities/pet';
import { useHasUnreadNotificationQuery } from '@entities/notification';
import { useUserStore } from '@entities/user';
import { logout } from '@shared/lib/auth/logout';
import { useStackNavigation, useOpenExternalLink } from '@shared/lib/bridge';
import {
  route,
  RELEASE_PERMISSION_SOURCE,
  RELEASE_PERMISSION_SOURCE_QUERY_KEY,
} from '@shared/constants/route';

const EXTERNAL_LINKS = {
  NOTICE: 'https://fifth-potato-175.notion.site/2006c15f67fb803aadc1f2ec7dbb8892?source=copy_link',
  OPEN_SOURCE_LICENSE: 'https://fifth-potato-175.notion.site/2ba6c15f67fb805d9b8df5db96f2bfc1?source=copy_link',
};

function Mypage() {
  const { push } = useStackNavigation();
  const user = useUserStore((state) => state.user);
  const openExternalLink = useOpenExternalLink();
  const isLoggedIn = !!user;
  const { data: hasUnreadNotification = false } = useHasUnreadNotificationQuery({
    userId: user?.userId,
    enabled: isLoggedIn,
  });
  const { isOwner: isOwnerVerified, isResolved: isOwnerRoleResolved } = useOwnerRole();
  const { isOwnerView, isGuardianView, canToggleRoleView, toggleRoleView } = useMypageRoleView();
  const { name, address, imageUrl, usesDefaultImage, canOpenKindergartenDetail } =
    useOwnerKindergarten();
  const { profile } = useOwnerProfile();
  const {
    profileImageUrl: ownerProfileImageUrl,
    loginProvider,
    loginEmail,
    canReleaseOperationPermission,
  } = useOwnerMypageSummary();

  const { data: petListResponse, isLoading: isPetListLoading } = usePetListQuery({
    enabled: isLoggedIn && (!isOwnerVerified || isGuardianView),
  });

  const openDogSelectSheet = () => {
    overlay.open(({ isOpen, close }) => (
      <DogSelectSheet isOpen={isOpen} close={close} dogs={petListResponse?.data || []} />
    ));
  };

  const hasDogs = (petListResponse?.data?.length ?? 0) > 0;
  const shouldShowOwnerVerification = isLoggedIn && isOwnerRoleResolved && !isOwnerVerified;

  const accountInfo: AccountInfo = {
    nickname: user?.nickname || '살구형',
    userId: user?.userId || '123456',
  };

  const handleDogClick = (petId: string) => {
    push({ pathname: '/mypage/pet-detail', query: { petId } });
  };

  const handleAddDog = () => {
    push({ pathname: '/mypage/pet-add' });
  };

  const handleOpenLink = (key: keyof typeof EXTERNAL_LINKS) => {
    openExternalLink(EXTERNAL_LINKS[key]);
  };

  const handleKindergartenClick = () => {
    push({ pathname: route.mypage.kindergarten.root });
  };

  const handleRoleViewToggle = () => {
    toggleRoleView();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // 로그아웃 API 실패 시에도 로컬 세션은 이미 정리됨(logout() 내부 finally)
    } finally {
      push({ pathname: route.auth.login.root });
    }
  };

  const handleWithdrawClick = () => {
    if (!isOwnerVerified) {
      push({ pathname: '/withdraw/confirm' });
      return;
    }

    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {ownerMypageContent.withdrawBlockedModalTitleLine1}
              <br />
              {ownerMypageContent.withdrawBlockedModalTitleLine2}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {ownerMypageContent.withdrawBlockedModalDescriptionLine1}
              <br />
              {ownerMypageContent.withdrawBlockedModalDescriptionLine2}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className='bg-fill-secondary-700 active:bg-fill-secondary-400'
              onClick={() => {
                close();
                push({
                  pathname: route.roleConversion.releasePermission.root,
                  query: {
                    [RELEASE_PERMISSION_SOURCE_QUERY_KEY]: RELEASE_PERMISSION_SOURCE.WITHDRAW,
                  },
                });
              }}
            >
              {ownerMypageContent.withdrawBlockedModalConfirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  };

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      <Header>
        <Header.Title>마이페이지</Header.Title>
        {!isOwnerView && (
          <Header.RightSection>
            <button
              type='button'
              aria-label='알림함'
              onClick={() => push({ pathname: route.notification.root })}
            >
              <Icon
                icon={hasUnreadNotification ? 'AlarmLineActive' : 'AlarmNone'}
                className='size-6 text-text-primary'
              />
            </button>
          </Header.RightSection>
        )}
      </Header>

      <div className='web:pb-(--bottom-bar-height) webview:pb-0 flex-1 overflow-y-auto'>
        {!isLoggedIn && <LoginPrompt />}

        {!isLoggedIn && (
          <>
            <Divider size='thick' />
            <div className='flex flex-col gap-5 px-4 pt-7 pb-7'>
              <QuickActionsSection className='gap-y-7 px-0 py-0' />
            </div>
          </>
        )}

        {isLoggedIn && canToggleRoleView && (
          <RoleConversionButton onClick={handleRoleViewToggle}>
            {isOwnerView
              ? roleConversionButtonContent.convertoGuardian
              : roleConversionButtonContent.convertToOwner}
          </RoleConversionButton>
        )}

        {isLoggedIn && isOwnerView ? (
          <div className='bg-background-0'>
            <OwnerProfileRow
              name={profile.name}
              profileImageUrl={
                profile.profileImageUrl ?? ownerProfileImageUrl ?? user.profileImageUrl
              }
              onClick={() => push({ pathname: route.mypage.profile.root })}
            />

            {name ? (
              <OwnerKindergartenCard
                name={name}
                address={address}
                imageUrl={imageUrl}
                usesDefaultImage={usesDefaultImage}
                onClick={canOpenKindergartenDetail ? handleKindergartenClick : undefined}
              />
            ) : null}

            <Divider size='thick' />
          </div>
        ) : (
          <>
            {isLoggedIn && !isPetListLoading && !hasDogs && (
              <div className='bg-bg-0 flex flex-col items-center px-4 py-5'>
                <NoDogPrompt
                  nickname={user?.nickname || '사용자'}
                  showRegistrationEmptyState
                  onAddDog={() => push({ pathname: '/mypage/pet-add' })}
                />
                {shouldShowOwnerVerification ? <OwnerVerificationEntry requiresLogin={false} variant='banner' /> : null}
              </div>
            )}

            {isLoggedIn && hasDogs && (
              <>
                <DogHouseSection
                  dogs={petListResponse?.data || []}
                  withBottomPadding={!shouldShowOwnerVerification}
                  onChangeRepresentative={openDogSelectSheet}
                  onDogClick={handleDogClick}
                  onAddDog={handleAddDog}
                />
                {shouldShowOwnerVerification ? (
                  <div className='bg-bg-0 flex flex-col items-center px-4 py-5'>
                    <OwnerVerificationEntry requiresLogin={false} variant='banner' />
                  </div>
                ) : null}
              </>
            )}

            {isLoggedIn && <Divider size='thick' />}
          </>
        )}

        {isLoggedIn && (
          <>
            <AccountSection
              variant={isOwnerView ? 'owner' : 'guardian'}
              accountInfo={accountInfo}
              accountSectionTitle={ownerMypageContent.accountSectionTitle}
              ttokIdLabel={ownerMypageContent.ttokIdLabel}
              ttokIdDescription={ownerMypageContent.ttokIdDescription}
              socialProvider={isOwnerView ? loginProvider : undefined}
              socialEmail={isOwnerView ? loginEmail : undefined}
              releasePermissionLabel={
                isOwnerView && canReleaseOperationPermission
                  ? ownerMypageContent.releasePermissionLabel
                  : undefined
              }
              onProfileClick={() => push({ pathname: route.mypage.guardian.profile.root })}
              onLocationClick={() => push({ pathname: '/mypage/profile/location' })}
              onConnectionApplicationsClick={() => push({ pathname: route.guardian.connectionApply.status.root })}
              onReleasePermissionClick={() => push({ pathname: route.roleConversion.releasePermission.root })}
            />

            <Divider size='thick' />
          </>
        )}

        {isLoggedIn && <QuickActionsSection />}

        <SettingsSection
          variant={isLoggedIn && isOwnerView ? 'owner' : 'guardian'}
          otherInfoTitle={ownerMypageContent.otherInfoTitle}
          logoutLabel={ownerMypageContent.logoutLabel}
          withdrawLabel={ownerMypageContent.withdrawLabel}
          onNoticeClick={() => handleOpenLink('NOTICE')}
          onNotificationClick={() => push({ pathname: '/alarm-setting' })}
          onTermsClick={() => push({ pathname: '/terms' })}
          onLicenseClick={() => handleOpenLink('OPEN_SOURCE_LICENSE')}
          onLogoutClick={handleLogout}
          onWithdrawClick={handleWithdrawClick}
        />
      </div>
    </div>
  );
}

export { Mypage };
