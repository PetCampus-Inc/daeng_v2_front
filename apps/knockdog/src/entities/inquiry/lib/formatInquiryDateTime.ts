/** 문의 목록·상세의 일시 표시. `YYYY. MM. DD HH:mm` (24h). 잘못된 값이면 빈 문자열 */
function formatInquiryDateTime(isoDateTime: string) {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}. ${month}. ${day} ${hours}:${minutes}`;
}

export { formatInquiryDateTime };
