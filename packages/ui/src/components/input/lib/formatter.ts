/**
 * 숫자만 포맷팅
 * @param value 포맷팅할 문자열
 * @returns 숫자만 포맷팅된 문자열
 */
export const formatOnlyNumber = (value: string): string =>
  value.replace(/\D/g, '');

/**
 * 영문자와 숫자만 포맷팅
 * @param value 포맷팅할 문자열
 * @returns 영문자와 숫자만 포함된 문자열
 */
export const formatAlphanumeric = (value: string): string =>
  value.replace(/[^A-Za-z0-9]/g, '');

/**
 * 일반/휴대폰 번호 하이픈 포맷팅
 * @param value 포맷팅할 문자열
 * @returns 포맷팅된 번호
 */
export const formatTelNumber = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);

  // 배열 순서 변경 X
  const patterns = [
    { length: 11, pattern: /^(\d{3})(\d{4})(\d{4})$/ }, // 000-0000-0000
    { length: 10, pattern: /^(\d{3})(\d{3})(\d{4})$/ }, // 000-000-0000
    { length: 9, pattern: /^(\d{2})(\d{3})(\d{4})$/ }, // 00-000-0000
  ];

  const matchedPattern = patterns.find((p) => numbers.length >= p.length);

  return matchedPattern
    ? numbers.replace(matchedPattern.pattern, '$1-$2-$3')
    : numbers;
};
