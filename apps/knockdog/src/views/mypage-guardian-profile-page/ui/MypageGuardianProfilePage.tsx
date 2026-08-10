'use client';

import { useEffect, useRef, useState } from 'react';
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
  type GuardianGender,
  type GuardianProfileFormValues,
} from '@features/guardian-profile-form';
import { USER_ADDRESS_TYPE, useUserStore } from '@entities/user';
import { Header } from '@widgets/Header';
import { useTabNavigation } from '@shared/lib/bridge';
import { SafeArea } from '@shared/ui/safe-area';

function MypageGuardianProfilePage() {
  const user = useUserStore((state) => state.user);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<GuardianGender>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [initialAddress, setInitialAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [emergencyPhoneNumber, setEmergencyPhoneNumber] = useState('');
  const [isPhoneNumberBlurred, setIsPhoneNumberBlurred] = useState(false);
  const [isEmergencyPhoneNumberBlurred, setIsEmergencyPhoneNumberBlurred] = useState(false);
  const initializedAddressUserIdRef = useRef<string | null>(null);
  const { navigateToTab } = useTabNavigation();
  const homeAddress = user?.addresses.find((item) => item.type === USER_ADDRESS_TYPE.HOME);
  const homeAddressValue = homeAddress?.roadAddress || homeAddress?.address || '';
  const phoneNumberError =
    isPhoneNumberBlurred && !isValidMobilePhone(phoneNumber) ? PHONE_FORMAT_ERROR : undefined;
  const emergencyPhoneNumberError =
    isEmergencyPhoneNumberBlurred &&
    emergencyPhoneNumber.length > 0 &&
    !isValidMobilePhone(emergencyPhoneNumber)
      ? PHONE_FORMAT_ERROR
      : undefined;
  const formValues = { name, gender, phoneNumber, address, addressDetail, emergencyPhoneNumber };
  const isSaveEnabled = isGuardianProfileFormValid(formValues);
  const isDirty = isGuardianProfileDirty(formValues, initialAddress);

  useEffect(() => {
    if (!user) {
      initializedAddressUserIdRef.current = null;
      setInitialAddress('');
      return;
    }

    if (initializedAddressUserIdRef.current === user.userId) return;

    setAddress(homeAddressValue);
    setInitialAddress(homeAddressValue);
    initializedAddressUserIdRef.current = user.userId;
  }, [homeAddressValue, user]);

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

  const handleFormChange = (nextValues: GuardianProfileFormValues) => {
    setName(nextValues.name);
    setGender(nextValues.gender);
    setPhoneNumber(nextValues.phoneNumber);
    setAddress(nextValues.address);
    setAddressDetail(nextValues.addressDetail);
    setEmergencyPhoneNumber(nextValues.emergencyPhoneNumber);
  };

  return (
    <SafeArea edges={['bottom']} className='bg-bg-0 flex h-dvh flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>보호자 프로필</Header.Title>
      </Header>

      <main className='min-h-0 flex-1 overflow-y-auto pt-5'>
        <div className='bg-fill-primary-50 mx-x4 radius-r3 flex h-[76px] items-center gap-x2 p-x4'>
          <Icon icon='AlertFill' className='text-fill-primary-500 size-6 shrink-0' />
          <div className='flex min-w-0 flex-1 flex-col justify-center'>
            <p className='body1-extrabold text-text-accent'>프로필을 완성해 보세요</p>
            <p className='body2-semibold text-text-primary'>유치원 등록 시 바로 제출할 수 있어요.</p>
          </div>
        </div>
        <div className='pt-x5'>
          <GuardianProfileFields
            values={formValues}
            phoneNumberError={phoneNumberError}
            emergencyPhoneNumberError={emergencyPhoneNumberError}
            onChange={handleFormChange}
            onPhoneNumberBlur={() => setIsPhoneNumberBlurred(true)}
            onEmergencyPhoneNumberBlur={() => setIsEmergencyPhoneNumberBlurred(true)}
          />
        </div>
      </main>

      <div className='bg-bg-0 px-x4 py-x5'>
        <ActionButton type='button' size='large' disabled={!isSaveEnabled}>
          저장하기
        </ActionButton>
      </div>
    </SafeArea>
  );
}

export { MypageGuardianProfilePage };
