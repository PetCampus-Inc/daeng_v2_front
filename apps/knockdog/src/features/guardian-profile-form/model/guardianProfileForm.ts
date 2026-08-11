const NAME_MAX_LENGTH = 20;
const ADDRESS_DETAIL_MAX_LENGTH = 100;

export const PHONE_FORMAT_ERROR = '전화번호 형식을 확인해 주세요. ex) 010-1234-5678';

const ADDRESS_DETAIL_FORBIDDEN_CHARACTER_PATTERN =
  /[\p{Extended_Pictographic}\p{Emoji_Modifier}\u200D\uFE0F\u0000-\u001F\u007F-\u009F\u2028\u2029]/gu;

export type GuardianGender = 'male' | 'female' | null;

export interface GuardianProfileFormValues {
  name: string;
  gender: GuardianGender;
  phoneNumber: string;
  address: string;
  addressDetail: string;
  emergencyPhoneNumber: string;
}

export function formatGuardianName(value: string) {
  return (value.match(/[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z ]/g) ?? []).join('').slice(0, NAME_MAX_LENGTH);
}

export function formatMobilePhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function isValidMobilePhone(value: string) {
  return /^010\d{8}$/.test(value.replace(/\D/g, ''));
}

export function formatAddressDetail(value: string) {
  return Array.from(value.replace(ADDRESS_DETAIL_FORBIDDEN_CHARACTER_PATTERN, ''))
    .slice(0, ADDRESS_DETAIL_MAX_LENGTH)
    .join('');
}

export function isGuardianProfileFormValid({ name, gender, phoneNumber, address, emergencyPhoneNumber }: GuardianProfileFormValues) {
  return (
    name.trim().length > 0 &&
    gender != null &&
    isValidMobilePhone(phoneNumber) &&
    address.length > 0 &&
    (emergencyPhoneNumber.length === 0 || isValidMobilePhone(emergencyPhoneNumber))
  );
}

export function isGuardianProfileDirty(
  { name, gender, phoneNumber, address, addressDetail, emergencyPhoneNumber }: GuardianProfileFormValues,
  initialAddress: string
) {
  return Boolean(name || gender != null || phoneNumber || address !== initialAddress || addressDetail || emergencyPhoneNumber);
}
