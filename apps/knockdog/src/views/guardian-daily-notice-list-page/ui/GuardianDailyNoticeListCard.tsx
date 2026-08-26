'use client';

import { Icon } from '@knockdog/ui';

import { guardianDailyNoticeListContent } from '@views/guardian-daily-notice-list-page/config/guardianDailyNoticeListContent';
import type { GuardianDailyNoticeMonthItem } from '@views/guardian-daily-notice-list-page/model/useGuardianDailyNoticeMonthList';
import { formatNoticeClockTime } from '@views/guardian-daily-notice-page/lib/formatGuardianDailyNotice';
import { AlbumImage } from '@shared/ui/album-image';

interface GuardianDailyNoticeListCardProps {
  item: GuardianDailyNoticeMonthItem;
  dateLabel: string;
  onClick?: () => void;
}

interface CheckInOutTimeProps {
  checkInLabel: string | null;
  checkOutLabel: string | null;
}

function CheckInOutTime({ checkInLabel, checkOutLabel }: CheckInOutTimeProps) {
  const { card } = guardianDailyNoticeListContent;

  return (
    <div className='flex items-center gap-0.5'>
      {checkInLabel ? (
        <div className='flex items-center gap-0.5'>
          <span className='caption1-regular text-text-secondary'>{card.checkInLabel}</span>
          <span className='caption1-semibold text-text-primary'>{checkInLabel}</span>
        </div>
      ) : null}
      {checkInLabel && checkOutLabel ? (
        <span className='caption1-semibold text-text-primary'>{card.timeSeparator}</span>
      ) : null}
      {checkOutLabel ? (
        <div className='flex items-center gap-0.5'>
          <span className='caption1-regular text-text-secondary'>{card.checkOutLabel}</span>
          <span className='caption1-semibold text-text-primary'>{checkOutLabel}</span>
        </div>
      ) : null}
    </div>
  );
}

interface NoticeBadgeProps {
  label: string;
  value: string;
}

function NoticeBadge({ label, value }: NoticeBadgeProps) {
  return (
    <span className='bg-fill-secondary-0 border-line-200 inline-flex items-center justify-center gap-1 rounded-full border px-2 py-1.5'>
      <span className='caption1-semibold text-text-secondary'>{label}</span>
      <span className='caption1-extrabold text-text-accent'>{value}</span>
    </span>
  );
}

/** 본문 우선. 없으면 간식 → 배변 메모 */
function resolveNoticeListPreview(notice: NonNullable<GuardianDailyNoticeMonthItem['dailyNotice']>) {
  const body = notice.body.trim();
  if (body) return body;

  const snack = notice.snack.trim();
  if (snack) return snack;

  const poopMemo = notice.poopMemo.trim();
  if (poopMemo) return poopMemo;

  return null;
}

function GuardianDailyNoticeListCard({
  item,
  dateLabel,
  onClick,
}: GuardianDailyNoticeListCardProps) {
  const { card } = guardianDailyNoticeListContent;
  const { checkInAt, checkOutAt, dailyNotice, thumbnailUrl } = item;

  const checkInLabel = checkInAt ? formatNoticeClockTime(checkInAt) : null;
  const checkOutLabel = checkOutAt ? formatNoticeClockTime(checkOutAt) : null;
  const noticePreview = dailyNotice ? resolveNoticeListPreview(dailyNotice) : null;
  const conditionLabel = dailyNotice?.conditionLabel || null;
  const stoolLabel = dailyNotice?.stoolLabel || null;
  const hasBadge = Boolean(conditionLabel || stoolLabel);

  // 알림장 미작성이면 등하원 시각만 가운데 정렬로 보여준다
  if (!dailyNotice) {
    return (
      <div className='bg-bg-0 radius-r5 flex w-full flex-col items-center gap-1 p-4'>
        <CheckInOutTime checkInLabel={checkInLabel} checkOutLabel={checkOutLabel} />
        <p className='label-semibold text-text-caption text-center'>{card.emptyNoticeMessage}</p>
      </div>
    );
  }

  return (
    <button
      type='button'
      className='bg-bg-0 radius-r5 flex w-full items-start gap-2 p-4 text-left'
      onClick={onClick}
      aria-label={card.detailAriaLabel(dateLabel)}
    >
      <div className='bg-bg-100 radius-r3 relative size-16 shrink-0 overflow-hidden'>
        {thumbnailUrl ? (
          <AlbumImage src={thumbnailUrl} className='absolute inset-0' />
        ) : (
          <Icon
            icon='Paw'
            className='text-fill-secondary-200 absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2'
            aria-hidden='true'
          />
        )}
      </div>

      <div className='flex min-w-0 flex-1 flex-col gap-3'>
        <div className='flex w-full flex-col gap-1'>
          <CheckInOutTime checkInLabel={checkInLabel} checkOutLabel={checkOutLabel} />
          {noticePreview ? (
            <p className='body2-regular text-text-primary line-clamp-3 w-full'>{noticePreview}</p>
          ) : null}
        </div>

        {hasBadge ? (
          <div className='flex w-full flex-wrap items-center gap-1'>
            {conditionLabel ? (
              <NoticeBadge label={card.conditionBadgeLabel} value={conditionLabel} />
            ) : null}
            {stoolLabel ? <NoticeBadge label={card.stoolBadgeLabel} value={stoolLabel} /> : null}
          </div>
        ) : null}
      </div>
    </button>
  );
}

export { GuardianDailyNoticeListCard };
