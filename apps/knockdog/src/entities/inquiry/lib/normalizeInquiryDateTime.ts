const pad = (value: number | undefined, length = 2) => String(value ?? 0).padStart(length, '0');

/**
 * 서버 일시를 `YYYY-MM-DDTHH:mm:ss` 문자열로 맞춘다.
 * API 문서는 문자열이지만 실제 응답은 `[년, 월, 일, 시, 분, 초, 나노초]` 배열로 온다(2026-10-15 DEV 확인). 둘 다 받는다.
 * 서버 일시는 KST이고 시간대 표기가 없어 기기 시간대로 읽힌다. 알 수 없는 값이면 빈 문자열
 */
function normalizeInquiryDateTime(value: unknown) {
  if (typeof value === 'string') return value;
  if (!Array.isArray(value) || !value.every((part) => typeof part === 'number')) return '';

  const [year, month, day, hours, minutes, seconds] = value as number[];
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export { normalizeInquiryDateTime };
