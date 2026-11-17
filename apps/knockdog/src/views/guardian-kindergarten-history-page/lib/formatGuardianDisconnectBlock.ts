const DISCONNECT_NO_EXPIRY_LABEL = '만료 없음';
const DISCONNECT_SCHEDULE_SUFFIX = '등원 예정';

/** `YYYY-MM-DD` → `YYYY.MM.DD` */
const toDotDate = (dateKey: string) => dateKey.replaceAll('-', '.');

/** 이용권 만료일 → `2026.01.12까지`. 만료일이 없으면 `만료 없음` */
const toTicketExpiryLabel = (expiresOn: string | null): string =>
  expiresOn ? `${toDotDate(expiresOn)}까지` : DISCONNECT_NO_EXPIRY_LABEL;

/** `HH:mm` → `오후 3:00`. 낮 12시는 오후 12:00, 자정 직후는 오전 12:xx */
const toKoreanTime = (time: string): string => {
  const [hourText = '', minuteText = ''] = time.split(':');
  const hour = Number(hourText);
  const meridiem = hour >= 12 ? '오후' : '오전';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${meridiem} ${displayHour}:${minuteText.padStart(2, '0')}`;
};

/** 예약 날짜·시간 → `2026.10.12 오후 3:00 등원 예정`. 시간이 없으면 날짜만 */
const toReservationScheduleLabel = (date: string, time: string | null): string =>
  [toDotDate(date), time ? toKoreanTime(time) : null, DISCONNECT_SCHEDULE_SUFFIX].filter(Boolean).join(' ');

export { toReservationScheduleLabel, toTicketExpiryLabel };
