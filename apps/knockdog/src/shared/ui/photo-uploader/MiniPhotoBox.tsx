import { Icon } from '@knockdog/ui';

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
    <div className='relative'>
      <div className={`relative overflow-hidden rounded-lg ${className}`}>
        {imageUrl && <img src={imageUrl} alt={alt} className='h-full w-full object-cover' loading='lazy' />}
        {badgeLabel ? (
          <div className='absolute inset-x-0 bottom-0 flex h-1/2 items-center justify-center bg-black/45 backdrop-blur-[2px]'>
            <span className='caption1-semibold text-center text-white'>{badgeLabel}</span>
          </div>
        ) : null}
      </div>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          type='button'
          aria-label='사진 삭제'
          className='absolute top-1 right-1 z-10'
        >
          <Icon icon='DeleteInput' className='h-5 w-5 text-neutral-700' />
        </button>
      )}
    </div>
  );
}

export { MiniPhotoBox };
