'use client';

import { useState } from 'react';
import { ActionButton } from '@knockdog/ui';

import {
  GuardianProfileFields,
  isGuardianProfileFormValid,
  isValidMobilePhone,
  PHONE_FORMAT_ERROR,
  type GuardianGender,
  type GuardianProfileFormValues,
} from '@features/guardian-profile-form';
import { Header } from '@widgets/Header';
import { SafeArea } from '@shared/ui/safe-area';

interface GuardianInvitePageProps {
  /** URL 경로에서 받은 초대 토큰. API 연동 단계에서 초대 정보 조회에 사용한다. */
  token: string;
}

/** 보호자 유치원 초대 및 가입 신청 화면의 퍼블리싱 진입점 */
function GuardianInvitePage({ token }: GuardianInvitePageProps) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<GuardianGender>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [emergencyPhoneNumber, setEmergencyPhoneNumber] = useState('');
  const [isPhoneNumberBlurred, setIsPhoneNumberBlurred] = useState(false);
  const [isEmergencyPhoneNumberBlurred, setIsEmergencyPhoneNumberBlurred] = useState(false);
  const values = { name, gender, phoneNumber, address, addressDetail, emergencyPhoneNumber };
  const phoneNumberError =
    isPhoneNumberBlurred && !isValidMobilePhone(phoneNumber) ? PHONE_FORMAT_ERROR : undefined;
  const emergencyPhoneNumberError =
    isEmergencyPhoneNumberBlurred && emergencyPhoneNumber.length > 0 && !isValidMobilePhone(emergencyPhoneNumber)
      ? PHONE_FORMAT_ERROR
      : undefined;

  const handleFormChange = (nextValues: GuardianProfileFormValues) => {
    setName(nextValues.name);
    setGender(nextValues.gender);
    setPhoneNumber(nextValues.phoneNumber);
    setAddress(nextValues.address);
    setAddressDetail(nextValues.addressDetail);
    setEmergencyPhoneNumber(nextValues.emergencyPhoneNumber);
  };

  return (
    <SafeArea edges={['bottom']} className='bg-bg-0 flex h-dvh flex-col' data-invite-token={token}>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>보호자 정보 입력</Header.Title>
      </Header>

      <main className='min-h-0 flex-1 overflow-y-auto'>
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
        <ActionButton type='button' size='large' disabled={!isGuardianProfileFormValid(values)}>
          신청
        </ActionButton>
      </div>
    </SafeArea>
  );
}

export { GuardianInvitePage };
