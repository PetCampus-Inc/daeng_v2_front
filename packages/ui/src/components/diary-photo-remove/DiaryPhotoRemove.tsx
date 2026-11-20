import { cn } from '@knockdog/ui/lib';

import removeIcon from './ico-delete-input.svg';

interface DiaryPhotoRemoveProps {
  className?: string;
  onClick?: () => void;
}

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

/** V4 / Dog Diary / ico_delete_input */
function DiaryPhotoRemove({ className, onClick }: DiaryPhotoRemoveProps) {
  return (
    <button
      type='button'
      aria-label='삭제'
      onClick={onClick}
      className={cn('inline-flex size-[24px] items-center justify-center', className)}
    >
      <img alt='' src={assetSrc(removeIcon)} width={18} height={18} />
    </button>
  );
}

export { DiaryPhotoRemove };
export type { DiaryPhotoRemoveProps };
