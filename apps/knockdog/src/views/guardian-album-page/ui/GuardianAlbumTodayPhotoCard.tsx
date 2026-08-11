'use client';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';

interface GuardianAlbumTodayPhotoCardProps {
  url: string;
  isNew: boolean;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

function GuardianAlbumTodayPhotoCard({
  url,
  isNew,
  isBookmarked,
  onToggleBookmark,
}: GuardianAlbumTodayPhotoCardProps) {
  const { today } = guardianAlbumContent;

  return (
    <div className='relative size-[150px] shrink-0 overflow-hidden rounded-lg'>
      {/* eslint-disable-next-line @next/next/no-img-element -- mock/S3 앨범 썸네일 */}
      <img src={url} alt='' className='size-full object-cover' loading='lazy' decoding='async' />

      {isNew ? (
        <span className='bg-fill-primary-500 caption1-semibold text-text-primary-inverse absolute top-2 left-2 rounded-full px-2 py-1'>
          {today.newBadgeLabel}
        </span>
      ) : null}

      <button
        type='button'
        className='absolute right-2 bottom-2 rounded-full bg-white p-1.5'
        aria-label={today.bookmarkAriaLabel}
        aria-pressed={isBookmarked}
        onClick={(event) => {
          event.stopPropagation();
          onToggleBookmark();
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={isBookmarked ? today.bookmarkIconActiveSrc : today.bookmarkIconDefaultSrc}
          alt=''
          width={20}
          height={20}
          className='size-4'
          draggable={false}
        />
      </button>
    </div>
  );
}

export { GuardianAlbumTodayPhotoCard };
