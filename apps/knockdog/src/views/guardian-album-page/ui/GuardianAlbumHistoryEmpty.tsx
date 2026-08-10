'use client';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';

function GuardianAlbumHistoryEmpty() {
  const { history } = guardianAlbumContent;

  return (
    <div className='flex w-full flex-col items-center py-4'>
      <p className='body1-medium text-text-secondary text-center'>{history.firstAttendanceMessage}</p>
    </div>
  );
}

export { GuardianAlbumHistoryEmpty };
