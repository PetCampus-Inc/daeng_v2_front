'use client';

import Image from 'next/image';

import { AlbumImage } from '@shared/ui/album-image';
import { guardianKindergartenAttendingContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenAttendingContent';

interface GuardianAlbumPhotoStackProps {
  photos: string[];
}

const FRAME_SLOTS = [
  {
    key: 'front',
    className:
      'absolute top-0 left-0 z-30 flex h-[213px] w-[177px] items-center justify-center',
    innerClassName:
      'relative h-[200px] w-[160px] -rotate-5 overflow-hidden rounded-[12px] border-2 border-white bg-bg-0 shadow-[0px_0px_8px_0px_rgba(0,0,0,0.08)]',
  },
  {
    key: 'back-top',
    className:
      'absolute top-0 left-[158px] z-10 flex h-[131px] w-[114px] items-center justify-center',
    innerClassName:
      'relative h-[120px] w-[100px] rotate-7 overflow-hidden rounded-[12px] border-2 border-white bg-bg-0 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)]',
  },
  {
    key: 'back-bottom',
    className:
      'absolute top-[107px] left-[149px] z-20 flex h-[112px] w-[130px] items-center justify-center',
    innerClassName:
      'relative h-[100px] w-[120px] rotate-6 overflow-hidden rounded-[12px] border-2 border-white bg-bg-0 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)]',
  },
] as const;

function GuardianAlbumPhotoStack({ photos }: GuardianAlbumPhotoStackProps) {
  const content = guardianKindergartenAttendingContent;
  // 1장: 좌측 큰 프레임, 2장: 우측 아래, 3장: 우측 위
  const slots = [
    photos[0] ?? null,
    photos[2] ?? null,
    photos[1] ?? null,
  ] as const;

  return (
    <div className='relative h-[220px] w-[280px] shrink-0'>
      {FRAME_SLOTS.map((frame, index) => {
        const photoUrl = slots[index];
        return (
          <div key={frame.key} className={frame.className}>
            <div className={frame.innerClassName}>
              {photoUrl ? (
                <AlbumImage src={photoUrl} className='absolute inset-0' />
              ) : (
                <Image
                  src={content.albumPlaceholderSrc}
                  alt={content.albumPlaceholderAlt}
                  width={48}
                  height={48}
                  className='absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 object-contain'
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { GuardianAlbumPhotoStack };
