const NAME_MAX_LENGTH = 30;
const ADDRESS_MAX_LENGTH = 50;
const ALLOWED_TEXT_PATTERN = /[\uAC00-\uD7A3\u3131-\u318Ea-zA-Z0-9!-/:-@\[-`{-~\s]/g;

function extractAllowedText(value: string, maxLength: number) {
  return (value.match(ALLOWED_TEXT_PATTERN) ?? []).join('').slice(0, maxLength);
}

function formatName(value: string) {
  return extractAllowedText(value, NAME_MAX_LENGTH);
}

function formatAddress(value: string) {
  return extractAllowedText(value, ADDRESS_MAX_LENGTH);
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

export { formatAddress, formatName, formatPhone };
