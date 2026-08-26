'use client';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import type { GuardianAlbumDayAlbum } from '@views/guardian-album-page/config/guardianAlbumMonthMock';
import type { GuardianAlbumTimelineRow } from '@views/guardian-album-page/model/buildGuardianAlbumMonthTimeline';
import { GuardianAlbumDayCard } from '@views/guardian-album-page/ui/GuardianAlbumDayCard';
import { GuardianAlbumHistoryEmpty } from '@views/guardian-album-page/ui/GuardianAlbumHistoryEmpty';

interface GuardianAlbumDayListProps {
  timeline: GuardianAlbumTimelineRow[];
  /** periods 없을 때 월 단위 폴백 배너 */
  showConnectionStartMessage?: boolean;
  showAttendedUntilMessage?: boolean;
  onDayClick?: (dayAlbum: GuardianAlbumDayAlbum) => void;
}

function GuardianAlbumHistoryBanner({ message }: { message: string }) {
  return (
    <div className='flex w-full flex-col items-center py-4'>
      <p className='body1-medium text-text-secondary text-center'>{message}</p>
    </div>
  );
}

function GuardianAlbumDayList({
  timeline,
  showConnectionStartMessage = false,
  showAttendedUntilMessage = false,
  onDayClick,
}: GuardianAlbumDayListProps) {
  const { history } = guardianAlbumContent;
  const hasPeriodBanners = timeline.some(
    (row) => row.type === 'connected' || row.type === 'disconnected'
  );

  return (
    <div className='mt-5 flex w-full flex-col gap-4 px-4'>
      {!hasPeriodBanners && showAttendedUntilMessage ? (
        <GuardianAlbumHistoryBanner message={history.attendedUntilMessage} />
      ) : null}
      {timeline.map((row) => {
        if (row.type === 'disconnected') {
          return (
            <GuardianAlbumHistoryBanner key={row.id} message={history.attendedUntilMessage} />
          );
        }
        if (row.type === 'connected') {
          return (
            <GuardianAlbumHistoryBanner key={row.id} message={history.firstAttendanceMessage} />
          );
        }
        return (
          <GuardianAlbumDayCard
            key={row.id}
            dayAlbum={row.day}
            onClick={() => onDayClick?.(row.day)}
          />
        );
      })}
      {!hasPeriodBanners && showConnectionStartMessage ? <GuardianAlbumHistoryEmpty /> : null}
    </div>
  );
}

export { GuardianAlbumDayList };
