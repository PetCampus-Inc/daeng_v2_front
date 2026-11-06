'use client';

import type { OwnerAlbumPhoto } from '@views/owner-album-page/model/ownerAlbumPhoto';
import { ownerAlbumContent } from '@views/owner-album-page/config/ownerAlbumContent';
import { groupAlbumPhotosByDate } from '@views/owner-album-page/lib/groupAlbumPhotosByDate';

import { useInfiniteScroll } from '@shared/lib/react/useInfiniteScroll';
import { InfiniteScrollFooter } from '@shared/ui/loading-spinner';
import { AlbumImage } from '@shared/ui/album-image';

const PREVIEW_LIMIT = 6;
/** 첫 화면(3열×2) 근처만 eager — 나머지는 lazy */
const ABOVE_FOLD_COUNT = 6;
const THUMB_SIZES = '(max-width: 480px) 33vw, 160px';

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

  let visibleIndex = 0;

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
                  const imageIndex = visibleIndex;
                  visibleIndex += 1;
                  const isLcpCandidate = imageIndex === 0;
                  const isAboveFold = imageIndex < ABOVE_FOLD_COUNT;

                  return (
                    <button
                      key={photo.id}
                      type='button'
                      onClick={() => onPhotoClick(photo.id)}
                      aria-label={ownerAlbumContent.thumbnailAriaLabel(imageIndex)}
                      className='bg-fill-secondary-100 relative aspect-square overflow-hidden'
                    >
                      <AlbumImage
                        src={photo.url}
                        alt=''
                        className='absolute inset-0'
                        optimize
                        sizes={THUMB_SIZES}
                        // LCP는 보통 첫 타일. next/image는 priority일 때만 fetchpriority=high가 안정적으로 붙음.
                        priority={isLcpCandidate}
                        fetchPriority={isLcpCandidate ? 'high' : undefined}
                        loading={isAboveFold ? 'eager' : 'lazy'}
                      />
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
        <InfiniteScrollFooter
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          sentinelRef={lastElementCallback}
        />
      </div>
    </div>
  );
}

export { OwnerAlbumPhotoList };
