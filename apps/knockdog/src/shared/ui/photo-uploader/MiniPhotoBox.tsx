import { Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

interface MiniPhotoBoxProps {
  imageUrl?: string;
  alt?: string;
  className?: string;
  onRemove?: () => void;
  /** 하단에 반투명 오버레이 + 라벨 (예: 대표 사진) */
  badgeLabel?: string;
}

function MiniPhotoBox({
  imageUrl,
  alt = '사진',
  className = '',
  onRemove,
  badgeLabel,
}: MiniPhotoBoxProps) {
  return (
    <div className={cn('relative size-20 shrink-0', className)}>
      <div className='size-full overflow-hidden rounded-lg'>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- 로컬/원격 미리보기 uri
          <img src={imageUrl} alt={alt} className='size-full object-cover' loading='lazy' />
        ) : null}
        {badgeLabel ? (
          <div className='absolute inset-x-0 bottom-0 flex h-1/2 items-center justify-center bg-black/45 backdrop-blur-[2px]'>
            <span className='caption1-semibold text-center text-white'>{badgeLabel}</span>
          </div>
        ) : null}
      </div>
      {onRemove ? (
        <button
          type='button'
          aria-label='사진 삭제'
          className='absolute top-1 right-1 z-20 inline-flex size-5 items-center justify-center'
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
        >
          <Icon icon='DeleteInput' className='text-fill-secondary-700 !size-5' />
        </button>
      ) : null}
    </div>
  );
}

export { MiniPhotoBox };
