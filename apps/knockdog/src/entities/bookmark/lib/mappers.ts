import { LocalDateTime } from '../model/bookmark';

/**
 * [YYYY, MM, DD, HH, MM, SS, Nanoseconds] to YYYY.MM.DD
 */
function formatMemoAt(memoAt: LocalDateTime): string {
  const [year, month, day] = memoAt;
  return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`;
}

export { formatMemoAt };
