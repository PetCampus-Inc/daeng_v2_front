'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ActionButton,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Icon,
} from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import {
  GuardianProfileFields,
  isGuardianProfileDirty,
  isGuardianProfileFormValid,
  isValidMobilePhone,
  PHONE_FORMAT_ERROR,
  type GuardianProfileFormValues,
} from '@features/guardian-profile-form';
import {
  USER_ADDRESS_TYPE,
  type GuardianProfileAddress,
  useUpdateGuardianProfileMutation,
  useUserInfoQuery,
  useUserStore,
} from '@entities/user';
import { useGuardianApplicationsQuery } from '@entities/guardian-application';
import { Header } from '@widgets/Header';
import { useTabNavigation } from '@shared/lib/bridge';
import { showGuardianProfileSaveFailureToast, showGuardianProfileSaveSuccessToast } from '../model/guardianProfileToast';

const EMPTY_FORM_VALUES: GuardianProfileFormValues = {
  name: '',
  gender: null,
  phoneNumber: '',
  address: '',
  addressDetail: '',
  emergencyPhoneNumber: '',
};

function toGuardianProfileFormValues({
  guardianName,
  gender,
  phoneNumber,
  guardianAddressDetail,
  emergencyPhoneNumber,
  homeAddress,
}: {
  guardianName?: string | null;
  gender?: string | null;
  phoneNumber?: string | null;
  guardianAddressDetail?: string | null;
  emergencyPhoneNumber?: string | null;
  homeAddress?: string | null;
}): GuardianProfileFormValues {
  return {
    name: guardianName?.trim() ?? '',
    gender: gender === 'MALE' ? 'male' : gender === 'FEMALE' ? 'female' : null,
    phoneNumber: phoneNumber?.trim() ?? '',
    address: homeAddress?.trim() ?? '',
    addressDetail: guardianAddressDetail?.trim() ?? '',
    emergencyPhoneNumber: emergencyPhoneNumber?.trim() ?? '',
  };
}

function hasCompletedGuardianProfile({
  guardianName,
  gender,
  phoneNumber,
  addresses,
}: {
  guardianName?: string | null;
  gender?: string | null;
  phoneNumber?: string | null;
  addresses?: Array<{ type: string; roadAddress?: string | null; address?: string | null }>;
}) {
  const homeAddress = addresses?.find((address) => address.type === USER_ADDRESS_TYPE.HOME);

  return Boolean(
    guardianName?.trim() &&
      (gender === 'MALE' || gender === 'FEMALE') &&
      isValidMobilePhone(phoneNumber ?? '') &&
      (homeAddress?.roadAddress?.trim() || homeAddress?.address?.trim())
  );
}

function MypageGuardianProfilePage() {
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();
  const { data: userInfoResponse, refetch: refetchUserInfo } = useUserInfoQuery(user?.userId);
  const { mutateAsync: updateGuardianProfile, isPending: isSaving } = useUpdateGuardianProfileMutation();
  const { data: guardianApplications, isSuccess: isGuardianApplicationsLoaded } = useGuardianApplicationsQuery({
    userId: user?.userId,
  });
  const [formValues, setFormValues] = useState<GuardianProfileFormValues>(EMPTY_FORM_VALUES);
  const [initialFormValues, setInitialFormValues] = useState<GuardianProfileFormValues>(EMPTY_FORM_VALUES);
  const [selectedAddress, setSelectedAddress] = useState<GuardianProfileAddress | null>(null);
  const [isPhoneNumberBlurred, setIsPhoneNumberBlurred] = useState(false);
  const [isEmergencyPhoneNumberBlurred, setIsEmergencyPhoneNumberBlurred] = useState(false);
  const initializedProfileRef = useRef<{ userId: string; source: 'store' | 'remote' } | null>(null);
  const { navigateToTab } = useTabNavigation();
  const userInfo = userInfoResponse?.userId === user?.userId ? userInfoResponse : undefined;
  const profileUser = userInfo ?? user;
  const homeAddress = profileUser?.addresses.find((item) => item.type === USER_ADDRESS_TYPE.HOME);
  const homeAddressValue = homeAddress?.roadAddress || homeAddress?.address || '';
  const homeAddressDetail =
    homeAddress?.detail?.trim() || homeAddress?.addressDetail?.trim() || userInfo?.guardianAddressDetail?.trim() || '';
  const phoneNumberError =
    isPhoneNumberBlurred && !isValidMobilePhone(formValues.phoneNumber) ? PHONE_FORMAT_ERROR : undefined;
  const emergencyPhoneNumberError =
    isEmergencyPhoneNumberBlurred &&
    formValues.emergencyPhoneNumber.length > 0 &&
    !isValidMobilePhone(formValues.emergencyPhoneNumber)
      ? PHONE_FORMAT_ERROR
      : undefined;
  const isSaveEnabled = isGuardianProfileFormValid(formValues) && selectedAddress !== null;
  const isDirty = isGuardianProfileDirty(formValues, initialFormValues);
  const hasApplicationHistory = (guardianApplications?.length ?? 0) > 0;
  const showProfileCompletionBanner =
    !hasCompletedGuardianProfile(profileUser ?? {}) && isGuardianApplicationsLoaded && !hasApplicationHistory;

  useEffect(() => {
    if (!user || !userInfoResponse || userInfoResponse.userId === user.userId) return;

    queryClient.removeQueries({ queryKey: ['userInfo'], exact: true });
    void refetchUserInfo();
  }, [queryClient, refetchUserInfo, user, userInfoResponse]);

  useEffect(() => {
    if (!profileUser) {
      initializedProfileRef.current = null;
      setFormValues(EMPTY_FORM_VALUES);
      setInitialFormValues(EMPTY_FORM_VALUES);
      setSelectedAddress(null);
      return;
    }

    const profileSource = userInfo ? 'remote' : 'store';
    const initializedProfile = initializedProfileRef.current;
    const isNewUser = initializedProfile?.userId !== profileUser.userId;
    const isRemoteProfileReady = profileSource === 'remote' && initializedProfile?.source === 'store';

    if (!isNewUser && (!isRemoteProfileReady || isDirty)) return;

    const nextFormValues = toGuardianProfileFormValues({
      ...profileUser,
      homeAddress: homeAddressValue,
      guardianAddressDetail: homeAddressDetail,
    });
    setFormValues(nextFormValues);
    setInitialFormValues(nextFormValues);
    setSelectedAddress({
      address: homeAddress?.address || homeAddressValue,
      roadAddress: homeAddress?.roadAddress || homeAddressValue,
    });
    initializedProfileRef.current = { userId: profileUser.userId, source: profileSource };
  }, [homeAddress, homeAddressDetail, homeAddressValue, isDirty, profileUser, userInfo]);

  const navigateToMypage = () => navigateToTab('/mypage');

  const handleBack = () => {
    if (!isDirty) {
      void navigateToMypage();
      return;
    }

    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>저장하지 않고 나갈까요?</AlertDialogTitle>
            <AlertDialogDescription>변경한 내용이 저장되지 않아요.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>아니오</AlertDialogCancel>
            <AlertDialogAction onClick={() => void navigateToMypage()}>예</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  };

  const handleSave = async () => {
    if (!isSaveEnabled || isSaving || formValues.gender == null || !selectedAddress) return;

    try {
      await updateGuardianProfile({
        name: formValues.name.trim(),
        gender: formValues.gender === 'male' ? 'MALE' : 'FEMALE',
        phoneNumber: formValues.phoneNumber,
        emergencyPhoneNumber: formValues.emergencyPhoneNumber,
        address: selectedAddress,
        addressDetail: formValues.addressDetail,
      });
      setInitialFormValues(formValues);
      showGuardianProfileSaveSuccessToast();
    } catch {
      showGuardianProfileSaveFailureToast();
    }
  };

  return (
    <div className='bg-bg-0 flex h-full flex-col'>
      <Header className='shrink-0'>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>보호자 프로필</Header.Title>
      </Header>

      <main className='min-h-0 flex-1 overflow-y-auto pt-5'>
        {showProfileCompletionBanner ? (
          <div className='bg-fill-primary-50 mx-x4 radius-r3 mb-x5 flex h-[76px] items-center gap-x2 p-x4'>
            <Icon icon='AlertFill' className='text-fill-primary-500 size-6 shrink-0' />
            <div className='flex min-w-0 flex-1 flex-col justify-center'>
              <p className='body1-extrabold text-text-accent'>프로필을 완성해 보세요</p>
              <p className='body2-semibold text-text-primary'>유치원 등록 시 바로 제출할 수 있어요.</p>
            </div>
          </div>
        ) : null}
        <div>
          <GuardianProfileFields
            values={formValues}
            phoneNumberError={phoneNumberError}
            emergencyPhoneNumberError={emergencyPhoneNumberError}
            onChange={setFormValues}
            onAddressSelect={({ pnu, address, roadAddress }) => setSelectedAddress({ pnu, address, roadAddress })}
            onAddressClear={() => setSelectedAddress(null)}
            onPhoneNumberBlur={() => setIsPhoneNumberBlurred(true)}
            onEmergencyPhoneNumberBlur={() => setIsEmergencyPhoneNumberBlurred(true)}
          />
        </div>
      </main>

      <div className='bg-bg-0 px-x4 py-x5'>
        <ActionButton type='button' size='large' disabled={!isSaveEnabled || isSaving} onClick={() => void handleSave()}>
          저장하기
        </ActionButton>
      </div>
    </div>
  );
}

export { MypageGuardianProfilePage };
