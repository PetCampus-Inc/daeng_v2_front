'use client';

import { useEffect, useState } from 'react';
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
  IconButton,
  TextField,
  TextFieldInput,
} from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { AddressPicker } from '@features/address-picker';
import { USER_ADDRESS_TYPE, useUserStore } from '@entities/user';
import { Header } from '@widgets/Header';
import { useTabNavigation } from '@shared/lib/bridge';
import { SafeArea } from '@shared/ui/safe-area';

const NAME_MAX_LENGTH = 20;
const ADDRESS_DETAIL_MAX_LENGTH = 100;
const PHONE_FORMAT_ERROR = '전화번호 형식을 확인해 주세요. ex) 010-1234-5678';
const ADDRESS_DETAIL_FORBIDDEN_CHARACTER_PATTERN =
  /[\p{Extended_Pictographic}\p{Emoji_Modifier}\u200D\uFE0F\u0000-\u001F\u007F-\u009F\u2028\u2029]/gu;

function formatGuardianName(value: string) {
  return (value.match(/[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z ]/g) ?? []).join('').slice(0, NAME_MAX_LENGTH);
}

function formatMobilePhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function isValidMobilePhone(value: string) {
  return /^010\d{8}$/.test(value.replace(/\D/g, ''));
}

function formatAddressDetail(value: string) {
  return Array.from(value.replace(ADDRESS_DETAIL_FORBIDDEN_CHARACTER_PATTERN, ''))
    .slice(0, ADDRESS_DETAIL_MAX_LENGTH)
    .join('');
}

function ClearInputButton({ ariaLabel, onClick }: { ariaLabel: string; onClick: () => void }) {
  return (
    <IconButton
      icon='DeleteInput'
      iconClassName='text-fill-secondary-700'
      aria-label={ariaLabel}
      onClick={onClick}
    />
  );
}

function MypageGuardianProfilePage() {
  const user = useUserStore((state) => state.user);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [emergencyPhoneNumber, setEmergencyPhoneNumber] = useState('');
  const [isPhoneNumberBlurred, setIsPhoneNumberBlurred] = useState(false);
  const [isEmergencyPhoneNumberBlurred, setIsEmergencyPhoneNumberBlurred] = useState(false);
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
  const isSaveEnabled =
    name.trim().length > 0 &&
    gender != null &&
    isValidMobilePhone(phoneNumber) &&
    address.length > 0 &&
    (emergencyPhoneNumber.length === 0 || isValidMobilePhone(emergencyPhoneNumber));
  const isDirty = Boolean(
    name ||
      gender != null ||
      phoneNumber ||
      address !== homeAddressValue ||
      addressDetail ||
      emergencyPhoneNumber
  );

  useEffect(() => {
    setAddress(homeAddressValue);
  }, [homeAddressValue]);

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
        <div className='flex flex-col pt-x5'>
          <div className='p-x4'>
            <TextField
              label='이름'
              required
              suffix={
                name ? <ClearInputButton ariaLabel='이름 지우기' onClick={() => setName('')} /> : undefined
              }
            >
              <TextFieldInput
                value={name}
                placeholder='이름을 입력해 주세요'
                onChange={(event) => setName(formatGuardianName(event.target.value))}
              />
            </TextField>
          </div>

          <div className='flex flex-col gap-x2 p-x4'>
            <div className='body2-bold text-text-primary flex h-5 items-center gap-0.5'>
              성별<span className='text-text-accent'>*</span>
            </div>
            <div className='flex h-x12 gap-x2'>
              <button
                type='button'
                className={`body2-semibold radius-r2 flex flex-1 items-center justify-center px-x3_5 py-x3_5 ${
                  gender === 'male'
                    ? 'bg-fill-secondary-700 text-text-primary-inverse'
                    : 'bg-bg-100 text-text-primary'
                }`}
                onClick={() => setGender('male')}
              >
                남
              </button>
              <button
                type='button'
                className={`body2-semibold radius-r2 flex flex-1 items-center justify-center px-x3_5 py-x3_5 ${
                  gender === 'female'
                    ? 'bg-fill-secondary-700 text-text-primary-inverse'
                    : 'bg-bg-100 text-text-primary'
                }`}
                onClick={() => setGender('female')}
              >
                여
              </button>
            </div>
          </div>

          <div className='px-x4 py-x4'>
            <TextField
              label='연락처'
              required
              invalid={!!phoneNumberError}
              suffix={
                phoneNumber ? <ClearInputButton ariaLabel='연락처 지우기' onClick={() => setPhoneNumber('')} /> : undefined
              }
            >
              <TextFieldInput
                value={phoneNumber}
                inputMode='tel'
                placeholder='보호자 전화번호를 입력해 주세요'
                onChange={(event) => setPhoneNumber(formatMobilePhone(event.target.value))}
                onBlur={() => setIsPhoneNumberBlurred(true)}
              />
            </TextField>
            {phoneNumberError ? <p className='text-error body2-regular pt-2'>{phoneNumberError}</p> : null}
          </div>

          <div className='relative z-10 flex h-[184px] flex-col gap-x2 py-x4'>
            <div className='flex h-[76px] flex-col gap-x2 px-x4'>
              <div className='body2-bold text-text-primary flex h-5 items-center gap-0.5'>
                주소<span className='text-text-accent'>*</span>
              </div>
              <AddressPicker
                variant='embedded'
                showLabel={false}
                fieldVariant='default'
                clearOnReselect
                inputClassName='h-x12'
                embeddedResultsClassName='top-[80%]'
                value={address}
                placeholder='주소를 검색하세요'
                onSelect={(selectedAddress) => setAddress(selectedAddress.roadAddress || selectedAddress.address)}
                onClear={() => {
                  setAddress('');
                  setAddressDetail('');
                }}
              />
            </div>

            <div className='h-[68px] px-x4 py-x2'>
              <TextField
                className='h-x13'
                disabled={!address}
                suffix={
                  addressDetail ? <ClearInputButton ariaLabel='상세 주소 지우기' onClick={() => setAddressDetail('')} /> : undefined
                }
              >
                <TextFieldInput
                  value={addressDetail}
                  placeholder='상세 주소를 입력해 주세요'
                  disabled={!address}
                  onChange={(event) => setAddressDetail(formatAddressDetail(event.target.value))}
                />
              </TextField>
            </div>
          </div>

          <div className='px-x4 py-x4'>
            <TextField
              label='비상 연락처'
              indicator='(선택)'
              invalid={!!emergencyPhoneNumberError}
              suffix={
                emergencyPhoneNumber ? (
                  <ClearInputButton ariaLabel='비상 연락처 지우기' onClick={() => setEmergencyPhoneNumber('')} />
                ) : undefined
              }
            >
              <TextFieldInput
                value={emergencyPhoneNumber}
                inputMode='tel'
                placeholder='보호자님 외 비상 연락처를 입력해 주세요'
                onChange={(event) => setEmergencyPhoneNumber(formatMobilePhone(event.target.value))}
                onBlur={() => setIsEmergencyPhoneNumberBlurred(true)}
              />
            </TextField>
            {emergencyPhoneNumberError ? (
              <p className='text-error body2-regular pt-2'>{emergencyPhoneNumberError}</p>
            ) : null}
          </div>
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
