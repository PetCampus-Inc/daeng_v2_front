const ADDRESS_DETAIL_MAX_LENGTH = 100;

// 키캡 결합 문자와 국기 이모지(regional indicator)는 Extended_Pictographic에
// 속하지 않아 별도로 제거 대상에 추가한다.
const ADDRESS_DETAIL_FORBIDDEN_CHARACTER_PATTERN =
  /[\p{Extended_Pictographic}\p{Emoji_Modifier}\u200D\uFE0F\u20E3\u{1F1E6}-\u{1F1FF}\u0000-\u001F\u007F-\u009F\u2028\u2029]/gu;

export function formatAddressDetail(value: string) {
  return Array.from(value.replace(ADDRESS_DETAIL_FORBIDDEN_CHARACTER_PATTERN, ''))
    .slice(0, ADDRESS_DETAIL_MAX_LENGTH)
    .join('');
}
