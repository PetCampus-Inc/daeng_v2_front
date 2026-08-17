'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
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
} from '@entities/user';
import { Header } from '@widgets/Header';
import { route } from '@shared/constants/route';
import { useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { SafeArea } from '@shared/ui/safe-area';
import { toast } from '@shared/ui/toast';

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
  const [values, setValues] = useState<GuardianProfileFormValues>(EMPTY_PROFILE_VALUES);
  const [selectedAddress, setSelectedAddress] = useState<GuardianProfileAddress | null>(null);
  const [isPhoneNumberBlurred, setIsPhoneNumberBlurred] = useState(false);
  const [isEmergencyPhoneNumberBlurred, setIsEmergencyPhoneNumberBlurred] = useState(false);
  const { push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const inviteQuery = useGuardianInviteQuery(token);
  const userInfoQuery = useUserInfoQuery();
  const initializedUserIdRef = useRef<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const phoneNumberError =
    isPhoneNumberBlurred && !isValidMobilePhone(values.phoneNumber) ? PHONE_FORMAT_ERROR : undefined;
  const emergencyPhoneNumberError =
    isEmergencyPhoneNumberBlurred && values.emergencyPhoneNumber.length > 0 && !isValidMobilePhone(values.emergencyPhoneNumber)
      ? PHONE_FORMAT_ERROR
      : undefined;

  useEffect(() => {
    if (!inviteQuery.isError) return;

    void push({
      pathname: route.invite.guardian.complete.root.replace('[token]', encodeURIComponent(token)),
      query: { status: 'invalid-invite' },
    });
  }, [inviteQuery.isError, push, token]);

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
      addressDetail: userInfo.guardianAddressDetail?.trim() ?? '',
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

  return (
    <SafeArea edges={['bottom']} className='bg-bg-0 flex h-dvh flex-col'>
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
            <span className='text-text-accent'>{inviteQuery.data?.data?.schoolName ?? '유치원'}</span>에 전달될 정보이니
            <br />
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
    </SafeArea>
  );
}

export { GuardianInvitePage };
