'use client';

import type { OwnerAlbumPhoto } from '@views/owner-album-page/model/ownerAlbumPhoto';
import { groupAlbumPhotosByDate } from '@views/owner-album-page/lib/groupAlbumPhotosByDate';

const PREVIEW_LIMIT = 6;

interface OwnerAlbumPhotoListProps {
  photos: OwnerAlbumPhoto[];
  onPhotoClick: (photoId: string) => void;
}

function OwnerAlbumPhotoList({ photos, onPhotoClick }: OwnerAlbumPhotoListProps) {
  const groups = groupAlbumPhotosByDate(photos);

  return (
    <div className='bg-bg-50 min-h-0 w-full flex-1 overflow-y-auto pb-(--bottom-bar-height)'>
      <div className='flex flex-col gap-5 py-5'>
        {groups.map((group) => {
          const remainingCount = group.photos.length - PREVIEW_LIMIT;
          const previewPhotos = group.photos.slice(0, PREVIEW_LIMIT);

          return (
            <section key={group.dateKey} className='flex flex-col gap-4'>
              <h2 className='body2-semibold text-text-secondary px-4'>{group.title}</h2>
              <div className='grid grid-cols-3 gap-2 px-4'>
                {previewPhotos.map((photo, index) => {
                  const isOverflowTile = remainingCount > 0 && index === PREVIEW_LIMIT - 1;

                  return (
                    <button
                      key={photo.id}
                      type='button'
                      onClick={() => onPhotoClick(photo.id)}
                      className='bg-fill-secondary-100 relative aspect-square overflow-hidden'
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- S3 pre-signed URL 임시 미리보기 */}
                      <img src={photo.url} alt='' className='h-full w-full object-cover' />
                      {isOverflowTile ? (
                        <div className='bg-dim-70 absolute inset-0 flex items-center justify-center'>
                          <span className='body2-regular text-text-primary-inverse'>{`+ ${remainingCount}`}</span>
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export { OwnerAlbumPhotoList };
