const ADDRESS_DETAIL_MAX_LENGTH = 100;

const ADDRESS_DETAIL_FORBIDDEN_CHARACTER_PATTERN =
  /[\p{Extended_Pictographic}\p{Emoji_Modifier}\u200D\uFE0F\u0000-\u001F\u007F-\u009F\u2028\u2029]/gu;

export function formatAddressDetail(value: string) {
  return Array.from(value.replace(ADDRESS_DETAIL_FORBIDDEN_CHARACTER_PATTERN, ''))
    .slice(0, ADDRESS_DETAIL_MAX_LENGTH)
    .join('');
}
