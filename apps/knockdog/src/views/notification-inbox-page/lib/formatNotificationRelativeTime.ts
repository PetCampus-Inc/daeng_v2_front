/**
 * 알림함 상대 시간 (floor).
 * - 0~59분 → n분 전
 * - 60분↑ → n시간 전
 * - 24시간↑ → n일 전
 */
function formatNotificationRelativeTime(sentAt: string | Date, now: Date = new Date()) {
  const sent = sentAt instanceof Date ? sentAt : new Date(sentAt);
  if (Number.isNaN(sent.getTime())) return '';

  const diffMs = Math.max(0, now.getTime() - sent.getTime());
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 60) {
    return `${Math.max(diffMinutes, 0)}분 전`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}일 전`;
}

export { formatNotificationRelativeTime };
