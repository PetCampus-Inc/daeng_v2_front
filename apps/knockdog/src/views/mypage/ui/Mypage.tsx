'use client';

import { Divider, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { Header } from '@widgets/Header';

import { SettingsSection } from '@features/app-settings';
import { LoginPrompt, OwnerVerificationEntry } from '@features/auth';
import { DogSelectSheet, DogHouseSection, NoDogPrompt } from '@features/dog-profile';
import {
  ownerMypageContent,
  OwnerKindergartenCard,
  OwnerProfileRow,
  RoleConversionButton,
  roleConversionButtonContent,
  useIsOwnerVerified,
  useOwnerKindergarten,
  useOwnerProfile,
} from '@features/role-conversion';
import { QuickActionsSection } from '@features/support';
import { AccountSection, type AccountInfo } from '@features/user-account';
import { usePetListQuery } from '@entities/pet';
import { useUserStore } from '@entities/user';
import { logout } from '@shared/lib/auth/logout';
import { useStackNavigation, useOpenExternalLink } from '@shared/lib/bridge';
import { useAppVersion } from '@shared/lib/device';
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
  const isOwnerVerified = useIsOwnerVerified();
  const { name, address, imageUrl, usesDefaultImage, canOpenKindergartenDetail } =
    useOwnerKindergarten();
  const { profile } = useOwnerProfile();
  const { data: petListResponse } = usePetListQuery({ enabled: isLoggedIn && !isOwnerVerified });
  const { displayVersion, hasUpdate, openStore } = useAppVersion();

  const openDogSelectSheet = () => {
    overlay.open(({ isOpen, close }) => (
      <DogSelectSheet isOpen={isOpen} close={close} dogs={petListResponse?.data || []} />
    ));
  };

  const hasDogs = (petListResponse?.data?.length ?? 0) > 0;

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

  const handleLogout = () => {
    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>로그아웃 할까요?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>아니오</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await logout();
                } finally {
                  push({ pathname: '/mypage' });
                }
              }}
            >
              예
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
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
      </Header>

      <div className='flex-1 overflow-y-auto pb-16'>
        {!isLoggedIn && <LoginPrompt />}

        {!isLoggedIn && (
          <>
            <Divider size='thick' />
            <div className='flex flex-col gap-5 px-4 pt-7 pb-7'>
              <OwnerVerificationEntry />
              <QuickActionsSection className='gap-y-7 px-0 py-0' />
            </div>
          </>
        )}

        {isLoggedIn && isOwnerVerified && (
          <RoleConversionButton
            disabled
            title={roleConversionButtonContent.convertToGuardianPendingNotice}
          >
            {roleConversionButtonContent.convertoGuardian}
          </RoleConversionButton>
        )}

        {isLoggedIn && isOwnerVerified ? (
          <div className='bg-background-0'>
            <OwnerProfileRow
              name={profile.name}
              profileImageUrl={profile.profileImageUrl ?? user.profileImageUrl}
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
            {isLoggedIn && !hasDogs && (
              <NoDogPrompt
                nickname={user?.nickname || '사용자'}
                onAddDog={() => push({ pathname: '/mypage/pet-add' })}
              />
            )}

            {isLoggedIn && hasDogs && (
              <DogHouseSection
                dogs={petListResponse?.data || []}
                onChangeRepresentative={openDogSelectSheet}
                onDogClick={handleDogClick}
                onAddDog={handleAddDog}
              />
            )}

            {isLoggedIn && <Divider size='thick' />}
          </>
        )}

        {isLoggedIn && (
          <>
            <div className={isOwnerVerified ? undefined : 'pt-4'}>
              <AccountSection
                variant={isOwnerVerified ? 'owner' : 'guardian'}
                accountInfo={isOwnerVerified ? undefined : accountInfo}
                accountSectionTitle={ownerMypageContent.accountSectionTitle}
                releasePermissionLabel={
                  isOwnerVerified ? ownerMypageContent.releasePermissionLabel : undefined
                }
                headerAddon={
                  !isOwnerVerified ? <OwnerVerificationEntry requiresLogin={false} /> : undefined
                }
                onAccountClick={() => push({ pathname: '/mypage/profile/manage' })}
                onLocationClick={() => push({ pathname: '/mypage/profile/location' })}
                onReleasePermissionClick={() =>
                  push({ pathname: route.roleConversion.releasePermission.root })
                }
              />
            </div>

            {isOwnerVerified && <Divider size='thick' />}
          </>
        )}

        {isLoggedIn && <QuickActionsSection />}

        <SettingsSection
          variant={isLoggedIn && isOwnerVerified ? 'owner' : 'guardian'}
          version={displayVersion}
          hasUpdate={hasUpdate}
          otherInfoTitle={ownerMypageContent.otherInfoTitle}
          logoutLabel={ownerMypageContent.logoutLabel}
          withdrawLabel={ownerMypageContent.withdrawLabel}
          onNoticeClick={() => handleOpenLink('NOTICE')}
          onNotificationClick={() => push({ pathname: '/alarm-setting' })}
          onTermsClick={() => push({ pathname: '/terms' })}
          onLicenseClick={() => handleOpenLink('OPEN_SOURCE_LICENSE')}
          onUpdateClick={openStore}
          onLogoutClick={handleLogout}
          onWithdrawClick={handleWithdrawClick}
        />
      </div>
    </div>
  );
}

export { Mypage };
