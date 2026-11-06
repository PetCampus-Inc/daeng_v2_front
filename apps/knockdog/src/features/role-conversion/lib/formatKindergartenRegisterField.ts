const NAME_MAX_LENGTH = 30;
const KINDERGARTEN_NAME_MAX_LENGTH = NAME_MAX_LENGTH;
const REPRESENTATIVE_NAME_MAX_LENGTH = 20;
const ADDRESS_MAX_LENGTH = 50;
/** 공백은 일반 스페이스만 — 줄바꿈/탭 거부. 이모지는 범위 밖이라 자동 제외 */
const NAME_ALLOWED_PATTERN = /[\uAC00-\uD7A3\u3131-\u318Ea-zA-Z0-9!-/:-@\[-`{-~ ]+/g;
const ALLOWED_TEXT_PATTERN = /[\uAC00-\uD7A3\u3131-\u318Ea-zA-Z0-9!-/:-@\[-`{-~\s]/g;
// representative name: allow Hangul, English letters, and space only (no digits/symbols)
const REPRESENTATIVE_NAME_ALLOWED_PATTERN = /[\uAC00-\uD7A3\u3131-\u318Ea-zA-Z ]/g;

function extractAllowedText(value: string, maxLength: number, pattern = ALLOWED_TEXT_PATTERN) {
  return (value.match(pattern) ?? []).join('').slice(0, maxLength);
}

/** 유치원명: 최대 30자(정확히 30 허용), 이모지·줄바꿈 거부, 숫자·기호·스페이스 허용 */
function formatName(value: string) {
  const withoutBreaks = value.replace(/[\r\n\u2028\u2029\t]/g, '');
  return extractAllowedText(withoutBreaks, KINDERGARTEN_NAME_MAX_LENGTH, NAME_ALLOWED_PATTERN);
}

function formatRepresentativeName(value: string) {
  return extractAllowedText(value, REPRESENTATIVE_NAME_MAX_LENGTH, REPRESENTATIVE_NAME_ALLOWED_PATTERN);
}

function formatAddress(value: string) {
  return extractAllowedText(value, ADDRESS_MAX_LENGTH);
}

/** 표시용 1줄 말줄임 — 백엔드 최대 길이와 동일 기준 */
function truncateKindergartenName(name: string, maxLength = KINDERGARTEN_NAME_MAX_LENGTH) {
  if (name.length <= maxLength) return name;
  return `${name.slice(0, maxLength)}…`;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '');

  if (digits.startsWith('050')) {
    const phone = digits.slice(0, 12);

    if (phone.length <= 4) return phone;
    if (phone.length <= 7) return `${phone.slice(0, 4)}-${phone.slice(4)}`;
    if (phone.length <= 11) return `${phone.slice(0, 4)}-${phone.slice(4, 7)}-${phone.slice(7)}`;

    return `${phone.slice(0, 4)}-${phone.slice(4, 8)}-${phone.slice(8, 12)}`;
  }

  if (digits.startsWith('02')) {
    const phone = digits.slice(0, 10);

    if (phone.length <= 2) return phone;
    if (phone.length <= 5) return `${phone.slice(0, 2)}-${phone.slice(2)}`;
    if (phone.length <= 9) return `${phone.slice(0, 2)}-${phone.slice(2, 5)}-${phone.slice(5)}`;

    return `${phone.slice(0, 2)}-${phone.slice(2, 6)}-${phone.slice(6, 10)}`;
  }

  if (digits.startsWith('15') || digits.startsWith('16') || digits.startsWith('18')) {
    const phone = digits.slice(0, 8);

    if (phone.length <= 4) return phone;

    return `${phone.slice(0, 4)}-${phone.slice(4, 8)}`;
  }

  const phone = digits.slice(0, 11);

  if (phone.length <= 3) return phone;
  if (phone.length <= 6) return `${phone.slice(0, 3)}-${phone.slice(3)}`;
  if (phone.length <= 10) return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;

  return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7, 11)}`;
}

function getPhoneDigits(value: string) {
  return value.replace(/\D/g, '');
}

function isValidKindergartenPhone(value: string) {
  const digits = getPhoneDigits(value);

  if (!digits) return false;

  if (digits.startsWith('050')) {
    return digits.length === 11 || digits.length === 12;
  }

  if (digits.startsWith('02')) {
    return digits.length === 9 || digits.length === 10;
  }

  if (digits.startsWith('15') || digits.startsWith('16') || digits.startsWith('18')) {
    return digits.length === 8;
  }

  if (digits.startsWith('01')) {
    return digits.length === 10 || digits.length === 11;
  }

  if (digits.startsWith('0')) {
    return digits.length === 10 || digits.length === 11;
  }

  return false;
}

function isValidRepresentativePhone(value: string) {
  const digits = getPhoneDigits(value);

  if (!digits) return false;

  return /^01\d{8,9}$/.test(digits);
}

function isValidEmail(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return false;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export {
  formatAddress,
  formatName,
  formatPhone,
  formatRepresentativeName,
  isValidEmail,
  isValidKindergartenPhone,
  isValidRepresentativePhone,
  KINDERGARTEN_NAME_MAX_LENGTH,
  REPRESENTATIVE_NAME_MAX_LENGTH,
  truncateKindergartenName,
};
