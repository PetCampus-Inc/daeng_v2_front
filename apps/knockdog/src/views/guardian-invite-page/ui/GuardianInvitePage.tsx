'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ActionButton, ProgressBar } from '@knockdog/ui';

import {
  GuardianProfileFields,
  isGuardianProfileFormValid,
  isValidMobilePhone,
  PHONE_FORMAT_ERROR,
  type GuardianProfileFormValues,
} from '@features/guardian-profile-form';
import { useGuardianInviteFlow } from '@features/guardian-invite-flow';
import { Header } from '@widgets/Header';
import { useStackNavigation } from '@shared/lib/bridge';
import { SafeArea } from '@shared/ui/safe-area';

/** 보호자 유치원 초대 및 가입 신청 화면의 퍼블리싱 진입점 */
function GuardianInvitePage() {
  const { token } = useParams<{ token: string }>();
  const { guardianProfileValues: values, setGuardianProfileValues } = useGuardianInviteFlow();
  const [isPhoneNumberBlurred, setIsPhoneNumberBlurred] = useState(false);
  const [isEmergencyPhoneNumberBlurred, setIsEmergencyPhoneNumberBlurred] = useState(false);
  const { push } = useStackNavigation();
  const phoneNumberError =
    isPhoneNumberBlurred && !isValidMobilePhone(values.phoneNumber) ? PHONE_FORMAT_ERROR : undefined;
  const emergencyPhoneNumberError =
    isEmergencyPhoneNumberBlurred && values.emergencyPhoneNumber.length > 0 && !isValidMobilePhone(values.emergencyPhoneNumber)
      ? PHONE_FORMAT_ERROR
      : undefined;

  const handleFormChange = (nextValues: GuardianProfileFormValues) => {
    setGuardianProfileValues(nextValues);
  };

  const handleNext = () => {
    if (!isGuardianProfileFormValid(values)) return;

    void push({
      pathname: `/invite/guardian/${encodeURIComponent(token)}/pet`,
    });
  };

  return (
    <SafeArea edges={['bottom']} className='bg-bg-0 flex h-dvh flex-col' data-invite-token={token}>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
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
            <span className='text-text-accent'>똑독 유치원</span>에 전달될 정보이니
            <br />
            정확한지 확인해 주세요.
          </p>
        </section>
        <GuardianProfileFields
          values={values}
          phoneNumberError={phoneNumberError}
          emergencyPhoneNumberError={emergencyPhoneNumberError}
          onChange={handleFormChange}
          onPhoneNumberBlur={() => setIsPhoneNumberBlurred(true)}
          onEmergencyPhoneNumberBlur={() => setIsEmergencyPhoneNumberBlurred(true)}
        />
      </main>

      <div className='bg-bg-0 px-x4 py-x5'>
        <ActionButton
          type='button'
          size='large'
          disabled={!isGuardianProfileFormValid(values)}
          onClick={handleNext}
        >
          다음
        </ActionButton>
      </div>
    </SafeArea>
  );
}

export { GuardianInvitePage };
