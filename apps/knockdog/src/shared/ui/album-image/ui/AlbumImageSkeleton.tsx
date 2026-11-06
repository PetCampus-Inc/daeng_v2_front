import { cn } from '@knockdog/ui/lib';

interface AlbumImageSkeletonProps {
  className?: string;
  isVisible?: boolean;
}

/** 앨범 썸네일/이미지 로딩용 회색 스켈레톤 */
function AlbumImageSkeleton({ className, isVisible = true }: AlbumImageSkeletonProps) {
  return (
    <div
      aria-hidden='true'
      className={cn(
        'bg-fill-secondary-200 absolute inset-0 size-full',
        'transition-opacity duration-500 ease-out motion-reduce:transition-none',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
    />
  );
}

export { AlbumImageSkeleton };
export type { AlbumImageSkeletonProps };
