import { CompareActionButtons } from './CompareActionButtons';
import { KindergartenSimpleComparison } from './KindergartenSimpleComparison';
import type { BookmarkItem } from '@entities/bookmark';
import { useStackNavigation } from '@shared/lib/bridge';

interface SelectionBarProps {
  selectedKindergartens: { left?: BookmarkItem; right?: BookmarkItem };
  onCloseClick: () => void;
  toggleSelection: (id: string) => void;
}

function SelectionBar({ selectedKindergartens, onCloseClick, toggleSelection }: SelectionBarProps) {
  const { push } = useStackNavigation();

  const TOTAL_COUNT = 2;
  const selectedCount = Object.values(selectedKindergartens).filter(Boolean).length;
  const isSelectionCompleted = selectedCount === TOTAL_COUNT;

  const handleCompareClick = () => {
    if (!isSelectionCompleted) return;
    const ids = Object.values(selectedKindergartens)
      .map((kg) => kg!.id)
      .join(',');

    push({ pathname: '/compare-complete', query: { ids } });
  };

  return (
    <div className='bg-fill-secondary-0 z-10 shadow-[0px_-2px_8px_0px_rgba(0,0,0,0.06)]'>
      <KindergartenSimpleComparison selectedKindergartens={selectedKindergartens} onItemClick={toggleSelection} />
      <CompareActionButtons
        disabled={!isSelectionCompleted}
        selectedCount={selectedCount}
        totalCount={TOTAL_COUNT}
        onClick={handleCompareClick}
        onClose={onCloseClick}
      />
    </div>
  );
}

export { SelectionBar };
