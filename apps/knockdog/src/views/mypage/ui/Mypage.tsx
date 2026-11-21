'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { Divider } from '@knockdog/ui';
import { overlay } from 'overlay-kit';
import { MypageSectionSkeleton } from '@views/mypage/ui/MypageSectionSkeleton';
import {
  AccountSection,
  DogHouseSection,
  QuickActionsSection,
  SettingsSection,
} from '@views/mypage/ui/MypageLazySections';
import { OwnerPassTemplateManagementSection } from '@views/mypage/ui/OwnerPassTemplateManagementSection';

import { Header } from '@widgets/Header';

import { DogSelectSheet, NoDogPrompt } from '@features/dog-profile';
import {
  ownerMypageContent,
  OwnerKindergartenCard,
  OwnerKindergartenCardSkeleton,
  OwnerProfileRow,
  OwnerVerificationEntry,
  RoleConversionButton,
  roleConversionButtonContent,
  showConvertedToGuardianToast,
  showConvertedToOwnerToast,
  useMypageRoleView,
  useOwnerKindergarten,
  useOwnerProfile,
  useOwnerMypageSummary,
  useOwnerRole,
} from '@features/role-conversion';
import type { AccountInfo } from '@features/user-account';
import { usePetListQuery } from '@entities/pet';
import { useHasUnreadNotificationQuery } from '@entities/notification';
import { useUserInfoQuery, useUserStore } from '@entities/user';
import { logout } from '@shared/lib/auth/logout';
import { NotificationBell } from '@shared/ui/notification-bell';
import { PrivateAccess } from '@shared/ui/private-access';
import { openConfirmDialog, useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { isNativeWebView } from '@shared/lib/device';
import { closeOverlayThenNavigate } from '@shared/lib/navigation/closeOverlayThenNavigate';
import { toast } from '@shared/ui/toast';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';
import {
  route,
  RELEASE_PERMISSION_SOURCE,
  RELEASE_PERMISSION_SOURCE_QUERY_KEY,
} from '@shared/constants/route';

/** 로그아웃 확인창 문구. 앱 확인창과 웹 확인창이 같이 쓴다. */
const LOGOUT_DIALOG = {
  title: '로그아웃 할까요?',
  cancelLabel: '아니오',
  confirmLabel: '예',
};

/** 운영 권한을 해제해야 탈퇴할 수 있다는 안내창. 앱 확인창과 웹 확인창이 같이 쓴다. */
const WITHDRAW_BLOCKED_DIALOG = {
  title: `${ownerMypageContent.withdrawBlockedModalTitleLine1}\n${ownerMypageContent.withdrawBlockedModalTitleLine2}`,
  description: `${ownerMypageContent.withdrawBlockedModalDescriptionLine1}\n${ownerMypageContent.withdrawBlockedModalDescriptionLine2}`,
  cancelLabel: ownerMypageContent.withdrawBlockedModalCancelLabel,
  confirmLabel: ownerMypageContent.withdrawBlockedModalConfirmLabel,
  confirmVariant: 'neutral' as const,
};

function MypageContent() {
  const { push, reset } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const user = useUserStore((state) => state.user);
  const { data: userInfoResponse } = useUserInfoQuery(user?.userId);
  const userInfo = userInfoResponse?.userId === user?.userId ? userInfoResponse : undefined;
  const { isOwner: isOwnerVerified, isResolved: isOwnerRoleResolved } = useOwnerRole();
  const { isOwnerView, isGuardianView, canToggleRoleView, setRoleView } = useMypageRoleView();
  const latestRoleView = useRef({ canToggleRoleView, isOwnerView });
  useLayoutEffect(() => {
    latestRoleView.current = { canToggleRoleView, isOwnerView };
  }, [canToggleRoleView, isOwnerView]);
  const { data: hasUnreadNotification = false } = useHasUnreadNotificationQuery({
    userId: user?.userId,
    audience: isOwnerView ? 'OWNER' : 'GUARDIAN',
    enabled: isOwnerRoleResolved,
  });
  const { name, address, imageUrl, usesDefaultImage, canOpenKindergartenDetail, isProfileLoading } =
    useOwnerKindergarten();
  const { profile } = useOwnerProfile();
  const {
    profileImageUrl: ownerProfileImageUrl,
    loginProvider,
    loginEmail,
    canReleaseOperationPermission,
  } = useOwnerMypageSummary();

  const { data: petListResponse, isLoading: isPetListLoading } = usePetListQuery({
    enabled: !isOwnerVerified || isGuardianView,
  });

  const openDogSelectSheet = () => {
    overlay.open(({ isOpen, close }) => (
      <DogSelectSheet isOpen={isOpen} close={close} dogs={petListResponse?.data || []} />
    ));
  };

  const hasDogs = (petListResponse?.data?.length ?? 0) > 0;
  const shouldShowOwnerVerification = isOwnerRoleResolved && !isOwnerVerified;

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

  const handleKindergartenClick = () => {
    push({ pathname: route.mypage.kindergarten.root });
  };

  const handleRoleViewToggle = async () => {
    if (!canToggleRoleView || isSwitchingRole) return;

    setIsSwitchingRole(true);
    const nextMode = isOwnerView ? 'guardian' : 'owner';

    try {
      if (isNativeWebView()) {
        await navigateToTab('/mypage', undefined, nextMode);

        const latest = latestRoleView.current;
        if (!latest.canToggleRoleView) {
          const currentMode = latest.isOwnerView ? 'owner' : 'guardian';
          if (currentMode !== nextMode) {
            await navigateToTab('/mypage', undefined, currentMode);
          }
          return;
        }
      }

      setRoleView(nextMode);
      if (nextMode === 'guardian') showConvertedToGuardianToast();
      else showConvertedToOwnerToast();
    } catch (error) {
      console.error('[Mypage] Failed to switch role view', error);
      toast('화면을 전환하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSwitchingRole(false);
    }
  };

  const performLogout = async () => {
    try {
      await logout();
    } catch {
      // 로그아웃 API 실패 시에도 로컬 세션은 이미 정리됨(logout() 내부 finally)
    } finally {
      await reset(route.auth.login.root);
    }
  };

  const openWebLogoutDialog = () => {
    overlay.open(({ isOpen, close }) => (
      <ConfirmDialog
        {...LOGOUT_DIALOG}
        isOpen={isOpen}
        onClose={close}
        onConfirm={() => {
          close();
          void performLogout();
        }}
      />
    ));
  };

  const handleLogoutClick = async () => {
    const result = await openConfirmDialog(LOGOUT_DIALOG);

    if (result.status === 'resolved') {
      if (result.action === 'confirm') void performLogout();
      return;
    }
    if (result.status === 'pending') return;

    openWebLogoutDialog();
  };

  const goToReleasePermission = () => {
    push({
      pathname: route.roleConversion.releasePermission.root,
      query: {
        [RELEASE_PERMISSION_SOURCE_QUERY_KEY]: RELEASE_PERMISSION_SOURCE.WITHDRAW,
      },
    });
  };

  const openWebWithdrawBlockedDialog = () => {
    overlay.open(({ isOpen, close }) => (
      <ConfirmDialog
        {...WITHDRAW_BLOCKED_DIALOG}
        isOpen={isOpen}
        onClose={close}
        onConfirm={() => closeOverlayThenNavigate(close, goToReleasePermission)}
      />
    ));
  };

  const handleWithdrawClick = async () => {
    if (!isOwnerVerified) {
      push({ pathname: '/withdraw/confirm' });
      return;
    }

    const result = await openConfirmDialog(WITHDRAW_BLOCKED_DIALOG);

    if (result.status === 'pending') return;

    if (result.status === 'resolved') {
      if (result.action === 'confirm') goToReleasePermission();
      return;
    }

    openWebWithdrawBlockedDialog();
  };

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      <Header>
        <Header.Title>마이페이지</Header.Title>
        <Header.RightSection>
          <NotificationBell
            hasUnread={hasUnreadNotification}
            onClick={() => push({ pathname: route.notification.root })}
          />
        </Header.RightSection>
      </Header>

      <div className='web:pb-(--bottom-bar-height) webview:pb-0 flex-1 overflow-y-auto'>
        {canToggleRoleView && (
          <RoleConversionButton
            onClick={handleRoleViewToggle}
            disabled={isSwitchingRole}
            className={isOwnerView ? 'bg-fill-primary-50 text-primitive-orange-400' : undefined}
          >
            {isOwnerView
              ? roleConversionButtonContent.convertoGuardian
              : roleConversionButtonContent.convertToOwner}
          </RoleConversionButton>
        )}

        {isOwnerView ? (
          <div className='bg-background-0'>
            <OwnerProfileRow
              name={profile.name}
              profileImageUrl={
                profile.profileImageUrl ?? ownerProfileImageUrl ?? user?.profileImageUrl
              }
              onClick={() => push({ pathname: route.mypage.profile.root })}
            />

            {isProfileLoading && !name ? (
              <OwnerKindergartenCardSkeleton />
            ) : name ? (
              <OwnerKindergartenCard
                name={name}
                address={address}
                imageUrl={imageUrl}
                usesDefaultImage={usesDefaultImage}
                onClick={canOpenKindergartenDetail ? handleKindergartenClick : undefined}
              />
            ) : null}

            <OwnerPassTemplateManagementSection />

            <Divider size='thick' />
          </div>
        ) : (
          <>
            {isPetListLoading ? (
              <MypageSectionSkeleton rows={3} />
            ) : !hasDogs ? (
              <div className='bg-bg-0 flex flex-col items-center px-4 py-5'>
                <NoDogPrompt
                  nickname={user?.nickname || '사용자'}
                  showRegistrationEmptyState
                  onAddDog={() => push({ pathname: '/mypage/pet-add' })}
                />
              </div>
            ) : (
              <DogHouseSection
                dogs={petListResponse?.data || []}
                onChangeRepresentative={openDogSelectSheet}
                onDogClick={handleDogClick}
                onAddDog={handleAddDog}
              />
            )}

            <Divider size='thick' />
          </>
        )}

        <AccountSection
          variant={isOwnerView ? 'owner' : 'guardian'}
          accountInfo={accountInfo}
          accountSectionTitle={ownerMypageContent.accountSectionTitle}
          ttokIdLabel={ownerMypageContent.ttokIdLabel}
          ttokIdDescription={ownerMypageContent.ttokIdDescription}
          socialProvider={isOwnerView ? loginProvider : userInfo?.loginProvider}
          socialEmail={isOwnerView ? loginEmail : userInfo?.infoRcvEmail}
          releasePermissionLabel={
            isOwnerView && canReleaseOperationPermission
              ? ownerMypageContent.releasePermissionLabel
              : undefined
          }
          onProfileClick={() => push({ pathname: route.mypage.guardian.profile.root })}
          onLocationClick={() => push({ pathname: '/mypage/profile/location' })}
          onConnectionHistoryClick={() => push({ pathname: route.kindergarten.connectionHistory.root })}
          onConnectionApplicationsClick={() => push({ pathname: route.guardian.connectionApply.status.root })}
          onMyReviewsClick={() => push({ pathname: route.mypage.guardian.reviews.root })}
          onReleasePermissionClick={() => push({ pathname: route.roleConversion.releasePermission.root })}
        />

        <Divider size='thick' />

        <QuickActionsSection variant={isOwnerView ? 'owner' : 'guardian'} />

        {!isOwnerView && shouldShowOwnerVerification ? (
          <div className='bg-bg-0 -mt-2 px-4 pb-5'>
            <OwnerVerificationEntry requiresLogin={false} variant='banner' />
          </div>
        ) : null}

        <SettingsSection
          otherInfoTitle={ownerMypageContent.otherInfoTitle}
          logoutLabel={ownerMypageContent.logoutLabel}
          withdrawLabel={ownerMypageContent.withdrawLabel}
          onNoticeClick={() => push({ pathname: route.mypage.notice.root })}
          onNotificationClick={() => push({ pathname: '/alarm-setting' })}
          onTermsClick={() => push({ pathname: '/terms' })}
          onLogoutClick={handleLogoutClick}
          onWithdrawClick={handleWithdrawClick}
        />
      </div>
    </div>
  );
}

function Mypage() {
  return (
    <PrivateAccess>
      <MypageContent />
    </PrivateAccess>
  );
}

export { Mypage };
