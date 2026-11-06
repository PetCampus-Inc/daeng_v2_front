import { Icon } from '@knockdog/ui';
import type { BookmarkItem } from '@entities/bookmark';
import type { CTag } from '@entities/compare';
import { serializeCategories } from '@entities/compare';

interface KindergartenSimpleComparisonProps {
  selectedKindergartens: { left?: BookmarkItem; right?: BookmarkItem };
  onItemClick: (id: string) => void;
}

function KindergartenSimpleComparison({ selectedKindergartens, onItemClick }: KindergartenSimpleComparisonProps) {
  return (
    <div className='flex px-4'>
      <KindergartenItem kindergarten={selectedKindergartens?.left} onClick={onItemClick} />

      <div className='relative py-2'>
        <div className='bg-line-200 my-auto h-15 w-px' />
        <Icon icon='VisVs' className='absolute top-1/2 left-0 h-6 w-6 -translate-x-1/2 -translate-y-1/2' />
      </div>

      <KindergartenItem kindergarten={selectedKindergartens?.right} onClick={onItemClick} />
    </div>
  );
}

interface KindergartenItemProps {
  kindergarten?: BookmarkItem;
  onClick: (id: string) => void;
}

function KindergartenItem({ kindergarten, onClick }: KindergartenItemProps) {
  const formatCategories = (categories?: CTag[]) => {
    if (!categories || categories.length === 0) return '';
    return serializeCategories(categories);
  };

  return (
    <div className='min-w-0 flex-1 p-4 text-center'>
      {!kindergarten ? (
        <div className='body1-extrabold text-text-tertiary truncate py-2.5'>유치원 선택</div>
      ) : (
        <button type='button' className='flex w-full flex-col gap-0.5' onClick={() => onClick(kindergarten.id)}>
          <div className='body1-extrabold text-text-primary w-full truncate'>{kindergarten?.name}</div>
          <div className='label-medium text-text-tertiary w-full truncate'>
            {formatCategories(kindergarten?.categories as CTag[])}
          </div>
        </button>
      )}
    </div>
  );
}

export { KindergartenSimpleComparison };
