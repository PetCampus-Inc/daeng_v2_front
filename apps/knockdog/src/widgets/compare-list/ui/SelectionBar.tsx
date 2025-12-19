import { KindergartenSimpleComparison } from './KindergartenSimpleComparison';
import { CompareActionButtons } from './CompareActionButtons';
import type { BookmarkItem } from '@entities/bookmark';
import { useStackNavigation, useTabNavigation } from '@shared/lib/bridge';

interface SelectionBarProps {
  selectedKindergartens: { left?: BookmarkItem; right?: BookmarkItem };
  resetSelection: () => void;
  toggleSelection: (id: string) => void;
}

function SelectionBar({ selectedKindergartens, resetSelection, toggleSelection }: SelectionBarProps) {
  const { push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();

  const TOTAL_COUNT = 2;
  const selectedCount = Object.values(selectedKindergartens).filter(Boolean).length;
  const isSelectionCompleted = selectedCount === TOTAL_COUNT;

  const handleCloseClick = () => {
    resetSelection();
    navigateToTab('/save');
  };
  const handleCompareClick = () => {
    if (!isSelectionCompleted) return;
    const ids = Object.values(selectedKindergartens)
      .map((kg) => kg!.id)
      .join(',');

    push({ pathname: '/compare-complete', query: { ids } });
  };

  return (
    <div className='bg-fill-secondary-0 relative z-10 mb-[60px] shadow-[0px_-2px_8px_0px_rgba(0,0,0,0.06)]'>
      <KindergartenSimpleComparison selectedKindergartens={selectedKindergartens} onItemClick={toggleSelection} />
      <CompareActionButtons
        disabled={!isSelectionCompleted}
        selectedCount={selectedCount}
        totalCount={TOTAL_COUNT}
        onClick={handleCompareClick}
        onClose={handleCloseClick}
      />
    </div>
  );
}

export { SelectionBar };
