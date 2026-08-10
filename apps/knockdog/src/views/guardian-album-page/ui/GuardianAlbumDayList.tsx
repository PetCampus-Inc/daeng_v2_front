'use client';

import type { GuardianAlbumDayAlbum } from '@views/guardian-album-page/config/guardianAlbumMonthMock';
import { GuardianAlbumDayCard } from '@views/guardian-album-page/ui/GuardianAlbumDayCard';
import { GuardianAlbumHistoryEmpty } from '@views/guardian-album-page/ui/GuardianAlbumHistoryEmpty';

interface GuardianAlbumDayListProps {
  days: GuardianAlbumDayAlbum[];
  showConnectionStartMessage: boolean;
}

function GuardianAlbumDayList({ days, showConnectionStartMessage }: GuardianAlbumDayListProps) {
  return (
    <div className='mt-5 flex w-full flex-col gap-4 px-4'>
      {days.map((dayAlbum) => (
        <GuardianAlbumDayCard key={dayAlbum.dateKey} dayAlbum={dayAlbum} />
      ))}
      {showConnectionStartMessage ? <GuardianAlbumHistoryEmpty /> : null}
    </div>
  );
}

export { GuardianAlbumDayList };
