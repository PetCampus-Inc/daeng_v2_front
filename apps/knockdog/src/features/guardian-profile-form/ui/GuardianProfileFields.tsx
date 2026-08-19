'use client';

import { IconButton, TextField, TextFieldInput } from '@knockdog/ui';

import { AddressPicker } from '@features/address-picker';
import type { Address } from '@entities/address';
import {
  formatAddressDetail,
  formatGuardianName,
  formatMobilePhone,
  type GuardianGender,
  type GuardianProfileFormValues,
} from '../model/guardianProfileForm';

const GENDER_OPTIONS = [
  { value: 'male', label: '남' },
  { value: 'female', label: '여' },
] as const satisfies readonly { value: Exclude<GuardianGender, null>; label: string }[];

interface GuardianProfileFieldsProps {
  values: GuardianProfileFormValues;
  phoneNumberError?: string;
  emergencyPhoneNumberError?: string;
  onChange: (nextValues: GuardianProfileFormValues) => void;
  onAddressSelect?: (address: Address) => void;
  onAddressClear?: () => void;
  onPhoneNumberBlur: () => void;
  onEmergencyPhoneNumberBlur: () => void;
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

/** 보호자 프로필을 작성하는 공통 입력 필드 묶음 */
function GuardianProfileFields({
  values,
  phoneNumberError,
  emergencyPhoneNumberError,
  onChange,
  onAddressSelect,
  onAddressClear,
  onPhoneNumberBlur,
  onEmergencyPhoneNumberBlur,
}: GuardianProfileFieldsProps) {
  const updateValue = (nextValue: Partial<GuardianProfileFormValues>) => {
    onChange({ ...values, ...nextValue });
  };

  return (
    <div className='flex flex-col'>
      <div className='p-x4'>
        <TextField
          label='이름'
          required
          suffix={
            values.name ? <ClearInputButton ariaLabel='이름 지우기' onClick={() => updateValue({ name: '' })} /> : undefined
          }
        >
          <TextFieldInput
            value={values.name}
            placeholder='이름을 입력해 주세요'
            onChange={(event) => {
              // 조합 중인 자모를 즉시 필터링하면 한글 IME 입력이 깨진다.
              // 조합 완료 뒤에만 완성형 한글·영문·공백으로 정규화한다.
              const isComposing = (event.nativeEvent as InputEvent).isComposing;
              const name = isComposing ? event.target.value : formatGuardianName(event.target.value);
              updateValue({ name });
            }}
            onCompositionEnd={(event) => updateValue({ name: formatGuardianName(event.currentTarget.value) })}
          />
        </TextField>
      </div>

      <div className='flex flex-col gap-y-2 p-x4'>
        <div className='body2-bold text-text-primary flex h-5 items-center gap-0.5'>
          성별<span className='text-text-accent'>*</span>
        </div>
        <div className='flex h-x12 gap-x2'>
          {GENDER_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type='button'
              aria-pressed={values.gender === value}
              className={`body2-semibold radius-r2 flex flex-1 items-center justify-center px-x3_5 py-x3_5 ${
                values.gender === value
                  ? 'bg-fill-secondary-700 text-text-primary-inverse'
                  : 'bg-bg-100 text-text-primary'
              }`}
              onClick={() => updateValue({ gender: value })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className='px-x4 py-x4'>
        <TextField
          label='연락처'
          required
          invalid={!!phoneNumberError}
          suffix={
            values.phoneNumber ? (
              <ClearInputButton ariaLabel='연락처 지우기' onClick={() => updateValue({ phoneNumber: '' })} />
            ) : undefined
          }
        >
          <TextFieldInput
            value={values.phoneNumber}
            inputMode='tel'
            placeholder='보호자 전화번호를 입력해 주세요'
            onChange={(event) => updateValue({ phoneNumber: formatMobilePhone(event.target.value) })}
            onBlur={onPhoneNumberBlur}
          />
        </TextField>
        {phoneNumberError ? <p className='text-error body2-regular pt-2'>{phoneNumberError}</p> : null}
      </div>

      <div className='relative z-10 flex h-[184px] flex-col gap-y-2 py-x4'>
        <div className='flex h-[76px] flex-col gap-y-2 px-x4'>
          <div className='body2-bold text-text-primary flex h-5 items-center gap-0.5'>
            주소<span className='text-text-accent'>*</span>
          </div>
          <AddressPicker
            variant='embedded'
            showLabel={false}
            fieldVariant='default'
            clearOnReselect
            inputClassName='h-x12'
            value={values.address}
            placeholder='주소를 검색하세요'
            onSelect={(selectedAddress) => {
              const address = selectedAddress.roadAddress || selectedAddress.address;

              onAddressSelect?.(selectedAddress);
              updateValue({ address, addressDetail: address === values.address ? values.addressDetail : '' });
            }}
            onClear={() => {
              onAddressClear?.();
              updateValue({ address: '', addressDetail: '' });
            }}
          />
        </div>

        <div className='h-[68px] px-x4 py-x2'>
          <TextField
            className='h-x13'
            suffix={
              values.addressDetail ? (
                <ClearInputButton ariaLabel='상세 주소 지우기' onClick={() => updateValue({ addressDetail: '' })} />
              ) : undefined
            }
          >
            <TextFieldInput
              value={values.addressDetail}
              placeholder='상세 주소를 입력해 주세요'
              onChange={(event) => updateValue({ addressDetail: formatAddressDetail(event.target.value) })}
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
            values.emergencyPhoneNumber ? (
              <ClearInputButton
                ariaLabel='비상 연락처 지우기'
                onClick={() => updateValue({ emergencyPhoneNumber: '' })}
              />
            ) : undefined
          }
        >
          <TextFieldInput
            value={values.emergencyPhoneNumber}
            inputMode='tel'
            placeholder='보호자님 외 비상 연락처를 입력해 주세요'
            onChange={(event) => updateValue({ emergencyPhoneNumber: formatMobilePhone(event.target.value) })}
            onBlur={onEmergencyPhoneNumberBlur}
          />
        </TextField>
        {emergencyPhoneNumberError ? (
          <p className='text-error body2-regular pt-2'>{emergencyPhoneNumberError}</p>
        ) : null}
      </div>
    </div>
  );
}

export { GuardianProfileFields };
