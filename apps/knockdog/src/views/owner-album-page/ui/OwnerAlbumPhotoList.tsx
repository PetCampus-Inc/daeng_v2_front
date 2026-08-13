'use client';

import type { OwnerAlbumPhoto } from '@views/owner-album-page/model/ownerAlbumPhoto';
import { groupAlbumPhotosByDate } from '@views/owner-album-page/lib/groupAlbumPhotosByDate';

import { useInfiniteScroll } from '@shared/lib/react/useInfiniteScroll';
import { AlbumImage } from '@shared/ui/album-image';

const PREVIEW_LIMIT = 6;

interface OwnerAlbumPhotoListProps {
  photos: OwnerAlbumPhoto[];
  onPhotoClick: (photoId: string) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}

function OwnerAlbumPhotoList({
  photos,
  onPhotoClick,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage = () => undefined,
}: OwnerAlbumPhotoListProps) {
  const groups = groupAlbumPhotosByDate(photos);
  const { lastElementCallback } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

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
                      <AlbumImage src={photo.url} className='absolute inset-0' />
                      {isOverflowTile ? (
                        <div className='bg-dim-70 absolute inset-0 z-10 flex items-center justify-center'>
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
        <div ref={lastElementCallback} aria-hidden='true' className='h-4' />
      </div>
    </div>
  );
}

export { OwnerAlbumPhotoList };
