import { Icon } from '@knockdog/ui';

interface MiniPhotoBoxProps {
  imageUrl?: string;
  alt?: string;
  className?: string;
  onRemove?: () => void;
}

function MiniPhotoBox({ imageUrl, alt = '사진', className = '', onRemove }: MiniPhotoBoxProps) {
  return (
    <div className='relative'>
      <div className={`overflow-hidden rounded-lg ${className}`}>
        {imageUrl && <img src={imageUrl} alt={alt} className='h-full w-full object-cover' loading='lazy' />}
      </div>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          type='button'
          aria-label='사진 삭제'
        >
          <Icon icon='DeleteInput' className='absolute right-1 top-1 h-5 w-5 text-neutral-700' />
        </button>
      )}
    </div>
  );
}

export { MiniPhotoBox };
