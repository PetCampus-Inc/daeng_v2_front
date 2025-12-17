import { BookmarkItem } from '@entities/bookmark';
import type { CTag } from '@entities/compare';
import { serializeCategories } from '@entities/compare';
import { useStackNavigation } from '@shared/lib/bridge';

interface SelectionBarProps {
  selectedKindergartens: { left?: BookmarkItem; right?: BookmarkItem };
  resetSelection: () => void;
}

function SelectionBar({ selectedKindergartens, resetSelection }: SelectionBarProps) {
  const { push } = useStackNavigation();

  const selectedCount = Object.values(selectedKindergartens).filter(Boolean).length;
  const canCompare = selectedCount === 2;

  const handleCloseClick = () => {
    resetSelection();
  };
  const handleCompareClick = () => {
    if (!canCompare) return;
    const ids = Object.values(selectedKindergartens)
      .map((kg) => kg!.id)
      .join(',');

    push({ pathname: '/compare-complete', query: { ids } });
  };

  return (
    <div className='sticky bottom-20 border-t border-[#F3F3F7] bg-white px-4 pt-3 pb-[env(safe-area-inset-bottom)]'>
      <div className='relative mb-3 grid grid-cols-2 items-start'>
        <div className='min-w-0'>
          <div className='truncate text-sm font-semibold'>{selectedKindergartens?.left?.name ?? '유치원 선택'}</div>
          <div className='truncate text-xs text-gray-500'>
            {serializeCategories(selectedKindergartens?.left?.categories as CTag[])}
          </div>
        </div>
        <div className='min-w-0 text-right'>
          <div className='truncate text-sm font-semibold'>{selectedKindergartens?.right?.name ?? '유치원 선택'}</div>
          <div className='truncate text-xs text-gray-500'>
            {serializeCategories(selectedKindergartens?.right?.categories as CTag[])}
          </div>
        </div>

        <div className='pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center'>
          <span className='font-extrabold text-orange-500'>VS</span>
          <span className='mt-1 h-6 w-px bg-gray-300' />
        </div>
      </div>

      <div className='flex items-center gap-3'>
        <button
          type='button'
          className='h-12 w-[92px] shrink-0 rounded-2xl border border-gray-300 bg-white text-sm font-medium text-gray-700'
          onClick={handleCloseClick}
        >
          종료
        </button>

        <button
          type='button'
          disabled={!canCompare}
          onClick={handleCompareClick}
          className={`h-12 flex-1 rounded-2xl text-sm font-semibold transition-colors ${
            canCompare ? 'bg-[#FF7A00] text-white' : 'cursor-not-allowed bg-gray-100 text-gray-400'
          } `}
        >
          {`비교하기 ${selectedCount}/2`}
        </button>
      </div>
    </div>
  );
}

export { SelectionBar };
