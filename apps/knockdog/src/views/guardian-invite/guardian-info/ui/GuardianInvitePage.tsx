'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ActionButton, ProgressBar } from '@knockdog/ui';

import {
  GuardianProfileFields,
  isGuardianProfileFormValid,
  isValidMobilePhone,
  PHONE_FORMAT_ERROR,
  type GuardianProfileFormValues,
} from '@features/guardian-profile-form';
import { useGuardianInviteQuery } from '@entities/guardian-invite';
import {
  USER_ADDRESS_TYPE,
  type GuardianProfileAddress,
  postUpdateGuardianProfile,
  useUserInfoQuery,
  useUserStore,
} from '@entities/user';
import { Header } from '@widgets/Header';
import { route } from '@shared/constants/route';
import { appendEntrySourceToInvitePath, useScreenAnalyticsTitle } from '@shared/lib/analytics';
import { useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { isAndroid, isIOS, isNativeWebView } from '@shared/lib/device';
import { toast } from '@shared/ui/toast';
import { PageError } from '@shared/ui/page-error';
import { tokenUtils } from '@shared/utils';
import { ApiError } from '@shared/api';
import { GuardianInviteAppInstallPage } from '@views/guardian-invite/guardian-info/ui/GuardianInviteAppInstallPage';

const EMPTY_PROFILE_VALUES: GuardianProfileFormValues = {
  name: '',
  gender: null,
  phoneNumber: '',
  address: '',
  addressDetail: '',
  emergencyPhoneNumber: '',
};

/** 보호자 유치원 초대 및 가입 신청 화면의 퍼블리싱 진입점 */
function GuardianInvitePage() {
  const { token } = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  const inviteRedirectPath = appendEntrySourceToInvitePath(
    route.invite.guardian.root.replace('[token]', encodeURIComponent(token)),
    searchParams
  );
  const user = useUserStore((state) => state.user);
  const { replace } = useStackNavigation();
  // SSR은 false를 사용하고, hydration 완료 후에만 실제 WebView 여부를 반영한다.
  const isNative = useSyncExternalStore(
    () => () => undefined,
    isNativeWebView,
    () => false
  );
  const isMobileBrowser = useSyncExternalStore(
    () => () => undefined,
    () => isIOS() || isAndroid(),
    () => false
  );
  // hydration 전에는 서버 스냅샷(false)을 사용하므로, 실제 플랫폼이 확정될 때까지 진입 화면을 렌더하지 않는다.
  const isPlatformResolved = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );
  const hasUserStoreHydrated = useSyncExternalStore(
    (onStoreChange) => useUserStore.persist.onFinishHydration(onStoreChange),
    () => useUserStore.persist.hasHydrated(),
    () => false
  );
  const hasAuth = Boolean(user) && tokenUtils.hasAccessToken();
  const isLoginRedirectingRef = useRef(false);

  useEffect(() => {
    if (!isNative || !hasUserStoreHydrated || hasAuth || isLoginRedirectingRef.current) return;

    isLoginRedirectingRef.current = true;
    void replace({
      pathname: route.auth.login.root,
      params: {
        redirectTo: inviteRedirectPath,
      },
    }).catch(() => {
      isLoginRedirectingRef.current = false;
      toast('로그인 화면으로 이동하지 못했어요. 다시 시도해 주세요.');
    });
  }, [hasAuth, hasUserStoreHydrated, inviteRedirectPath, isNative, replace, token]);

  // 모바일 브라우저 폴백은 스토어로, 그 외 웹은 기존 초대 페이지로 유지한다.
  if (!isPlatformResolved) return null;

  if (!isNative && isMobileBrowser) return <GuardianInviteAppInstallPage token={token} />;

  if (!isNative) return <GuardianInviteProfilePage token={token} inviteRedirectPath={inviteRedirectPath} />;

  if (!hasUserStoreHydrated || !hasAuth) return null;

  return <GuardianInviteProfilePage token={token} inviteRedirectPath={inviteRedirectPath} />;
}

/** 로그인된 앱 사용자에게 노출하는 보호자 정보 입력 화면 */
function GuardianInviteProfilePage({ token, inviteRedirectPath }: { token: string; inviteRedirectPath: string }) {
  const [values, setValues] = useState<GuardianProfileFormValues>(EMPTY_PROFILE_VALUES);
  const [selectedAddress, setSelectedAddress] = useState<GuardianProfileAddress | null>(null);
  const [isPhoneNumberBlurred, setIsPhoneNumberBlurred] = useState(false);
  const [isEmergencyPhoneNumberBlurred, setIsEmergencyPhoneNumberBlurred] = useState(false);
  const { push, replace } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const inviteQuery = useGuardianInviteQuery(token);
  const userId = useUserStore((state) => state.user?.userId);
  const userInfoQuery = useUserInfoQuery(userId);
  const initializedUserIdRef = useRef<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoginNavigationFailed, setIsLoginNavigationFailed] = useState(false);

  const schoolName = inviteQuery.data?.data?.schoolName;
  useScreenAnalyticsTitle(schoolName ? `${schoolName} 보호자 초대` : null);
  const phoneNumberError =
    isPhoneNumberBlurred && !isValidMobilePhone(values.phoneNumber) ? PHONE_FORMAT_ERROR : undefined;
  const emergencyPhoneNumberError =
    isEmergencyPhoneNumberBlurred && values.emergencyPhoneNumber.length > 0 && !isValidMobilePhone(values.emergencyPhoneNumber)
      ? PHONE_FORMAT_ERROR
      : undefined;
  const redirectToLogin = useCallback(async () => {
    setIsLoginNavigationFailed(false);

    try {
      await replace({
        pathname: route.auth.login.root,
        params: {
          redirectTo: inviteRedirectPath,
        },
      });
    } catch {
      setIsLoginNavigationFailed(true);
      toast('로그인 화면으로 이동하지 못했어요. 다시 시도해 주세요.');
    }
  }, [inviteRedirectPath, replace, token]);

  useEffect(() => {
    if (!inviteQuery.isError) return;

    if (inviteQuery.error instanceof ApiError && inviteQuery.error.status === 401) {
      void redirectToLogin();
      return;
    }

    void push({
      pathname: route.invite.guardian.complete.root.replace('[token]', encodeURIComponent(token)),
      query: { status: 'invalid-invite' },
    });
  }, [inviteQuery.error, inviteQuery.isError, push, redirectToLogin, token]);

  useEffect(() => {
    const userInfo = userInfoQuery.data;
    if (!userInfo || initializedUserIdRef.current === userInfo.userId) return;

    const homeAddress = userInfo.addresses.find((address) => address.type === USER_ADDRESS_TYPE.HOME);
    const address = homeAddress?.roadAddress || homeAddress?.address || '';
    setValues({
      name: userInfo.guardianName?.trim() ?? '',
      gender: userInfo.gender === 'MALE' ? 'male' : userInfo.gender === 'FEMALE' ? 'female' : null,
      phoneNumber: userInfo.phoneNumber?.trim() ?? '',
      address,
      addressDetail: homeAddress?.detail?.trim() || homeAddress?.addressDetail?.trim() || userInfo.guardianAddressDetail?.trim() || '',
      emergencyPhoneNumber: userInfo.emergencyPhoneNumber?.trim() ?? '',
    });
    setSelectedAddress(
      address
        ? {
            address: homeAddress?.address || address,
            roadAddress: homeAddress?.roadAddress || address,
          }
        : null
    );
    initializedUserIdRef.current = userInfo.userId;
  }, [userInfoQuery.data]);

  const handleNext = async () => {
    if (!isGuardianProfileFormValid(values) || !selectedAddress || isSaving) return;

    setIsSaving(true);
    try {
      await postUpdateGuardianProfile({
        name: values.name.trim(),
        gender: values.gender === 'male' ? 'MALE' : 'FEMALE',
        phoneNumber: values.phoneNumber,
        emergencyPhoneNumber: values.emergencyPhoneNumber,
        address: selectedAddress,
        addressDetail: values.addressDetail,
      });
      await push({ pathname: route.invite.guardian.pet.root.replace('[token]', encodeURIComponent(token)) });
    } catch {
      toast('보호자 정보 저장에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    void navigateToTab('/');
  };

  if (isLoginNavigationFailed) {
    return (
      <PageError
        layout='overlay'
        title='로그인 화면으로 이동하지 못했어요'
        description='잠시 후 다시 시도해 주세요.'
        onRetry={() => void redirectToLogin()}
      />
    );
  }

  return (
    <div className='bg-bg-0 flex h-full flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>보호자 정보 입력</Header.Title>
      </Header>

      <div className='shrink-0 px-x4 py-x2'>
        <ProgressBar totalSteps={3} value={1} className='h-1.5' />
      </div>

      <main className='min-h-0 flex-1 overflow-y-auto'>
        <section className='flex h-[120px] flex-col justify-center gap-1 px-x4 py-x5'>
          <h1 className='h2-extrabold text-text-primary'>보호자 정보를 입력해 주세요</h1>
          <p className='body1-medium text-text-primary'>
            <span className='flex min-w-0 items-baseline'>
              <span className='text-text-accent min-w-0 truncate'>
                {inviteQuery.data?.data?.schoolName ?? '유치원'}
              </span>
              <span className='shrink-0 whitespace-nowrap'>에 전달될 정보이니</span>
            </span>
            정확한지 확인해 주세요.
          </p>
        </section>
        <GuardianProfileFields
          values={values}
          phoneNumberError={phoneNumberError}
          emergencyPhoneNumberError={emergencyPhoneNumberError}
          onChange={setValues}
          onAddressSelect={({ pnu, address, roadAddress }) => setSelectedAddress({ pnu, address, roadAddress })}
          onAddressClear={() => setSelectedAddress(null)}
          onPhoneNumberBlur={() => setIsPhoneNumberBlurred(true)}
          onEmergencyPhoneNumberBlur={() => setIsEmergencyPhoneNumberBlurred(true)}
        />
      </main>

      <div className='bg-bg-0 px-x4 py-x5'>
        <ActionButton
          type='button'
          size='large'
          disabled={!isGuardianProfileFormValid(values) || !selectedAddress || inviteQuery.isLoading || inviteQuery.isError || isSaving}
          onClick={() => void handleNext()}
        >
          다음
        </ActionButton>
      </div>
    </div>
  );
}

export { GuardianInvitePage };
