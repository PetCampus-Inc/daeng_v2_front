/**
 * 출생 연도로부터 현재 나이를 계산합니다.
 * @param birthYear - 출생 연도
 * @returns 현재 나이 (만 나이)
 */
export function calculateAge(birthYear: number): number {
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
}

function isValidBirthYear(birthYear: number | null | undefined): birthYear is number {
  return typeof birthYear === 'number' && Number.isInteger(birthYear) && birthYear > 0;
}

/**
 * 출생 연도로부터 현재 나이를 "N살" 형태의 문자열로 반환합니다.
 * @param birthYear - 출생 연도
 * @returns "N살" 형태의 문자열
 */
export function formatAge(birthYear: number | null | undefined): string {
  if (!isValidBirthYear(birthYear)) return '';

  const age = calculateAge(birthYear);
  if (age < 1) return '1살 미만';
  return `${age}살`;
}
