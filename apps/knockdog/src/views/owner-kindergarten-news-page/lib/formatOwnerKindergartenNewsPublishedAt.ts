import {
  formatKstDayLabel,
  formatKstTimeLabel,
  getKstDateKey,
  getKstDateParts,
} from '@shared/lib/calendar-date';

import { OWNER_KINDERGARTEN_NEWS_NEW_BADGE_MS } from '@views/owner-kindergarten-news-page/model/ownerKindergartenNews';

/**
 * 작성일자 표기
 * - 당일: floor 기준 상대 시간 (n분 전 / n시간 전)
 * - 그 외: [YYYY년 ]M월 D일 (요일) 오전/오후 H:MM (올해면 연도 생략)
 */
function formatOwnerKindergartenNewsPublishedAt(publishedAt: Date, now = new Date()) {
  if (getKstDateKey(publishedAt) === getKstDateKey(now)) {
    const elapsedMs = Math.max(now.getTime() - publishedAt.getTime(), 0);
    const elapsedMinutes = Math.floor(elapsedMs / (60 * 1000));

    if (elapsedMinutes < 60) return `${elapsedMinutes}분 전`;

    const elapsedHours = Math.floor(elapsedMinutes / 60);
    return `${elapsedHours}시간 전`;
  }

  const publishedParts = getKstDateParts(publishedAt);
  const nowParts = getKstDateParts(now);
  const yearPrefix =
    publishedParts.year === nowParts.year ? '' : `${publishedParts.year}년 `;

  return `${yearPrefix}${publishedParts.month}월 ${publishedParts.day}일 ${formatKstDayLabel(publishedAt)} ${formatKstTimeLabel(publishedAt)}`;
}

/** 업로드 시각 기준 KST 3일(72h) 이내면 새소식 배지 */
function isOwnerKindergartenNewsNewBadge(publishedAt: Date, now = new Date()) {
  return now.getTime() - publishedAt.getTime() < OWNER_KINDERGARTEN_NEWS_NEW_BADGE_MS;
}

export { formatOwnerKindergartenNewsPublishedAt, isOwnerKindergartenNewsNewBadge };
