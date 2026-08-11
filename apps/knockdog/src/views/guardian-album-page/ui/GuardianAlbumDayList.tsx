'use client';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import type { GuardianAlbumDayAlbum } from '@views/guardian-album-page/config/guardianAlbumMonthMock';
import { GuardianAlbumDayCard } from '@views/guardian-album-page/ui/GuardianAlbumDayCard';
import { GuardianAlbumHistoryEmpty } from '@views/guardian-album-page/ui/GuardianAlbumHistoryEmpty';

interface GuardianAlbumDayListProps {
  days: GuardianAlbumDayAlbum[];
  showConnectionStartMessage: boolean;
  /** 연결 해제 유치원 · 마지막 재원 월 상단 문구 */
  showAttendedUntilMessage?: boolean;
  onDayClick?: (dayAlbum: GuardianAlbumDayAlbum) => void;
}

function GuardianAlbumDayList({
  days,
  showConnectionStartMessage,
  showAttendedUntilMessage = false,
  onDayClick,
}: GuardianAlbumDayListProps) {
  const { history } = guardianAlbumContent;

  return (
    <div className='mt-5 flex w-full flex-col gap-4 px-4'>
      {showAttendedUntilMessage ? (
        <p className='body1-medium text-text-secondary py-4 text-center'>
          {history.attendedUntilMessage}
        </p>
      ) : null}
      {days.map((dayAlbum) => (
        <GuardianAlbumDayCard
          key={dayAlbum.dateKey}
          dayAlbum={dayAlbum}
          onClick={() => onDayClick?.(dayAlbum)}
        />
      ))}
      {showConnectionStartMessage ? <GuardianAlbumHistoryEmpty /> : null}
    </div>
  );
}

export { GuardianAlbumDayList };
