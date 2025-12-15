import { Dropdown } from './DropDown';
import { REFERENCE_POINT_TYPE, type ReferencePointType } from '@entities/compare';

const REFERENCE_POINT_OPTIONS = Object.entries(REFERENCE_POINT_TYPE).map(([value, label]) => ({
  value: value as ReferencePointType,
  label,
  displayLabel: `거리기준: ${label}`,
}));

interface FilterBarProps {
  refPoint: ReferencePointType;
  onChangeRefPoint: (value: ReferencePointType) => void;
  showMemoOnly: boolean;
  onMemoToggle: () => void;
}

export function FilterBar({ refPoint, onChangeRefPoint, showMemoOnly, onMemoToggle }: FilterBarProps) {
  return (
    <div className='border-line-200 flex items-center justify-between border-y bg-white px-4 py-2'>
      <button
        type='button'
        aria-label='메모 필터'
        aria-pressed={showMemoOnly}
        onClick={onMemoToggle}
        className='flex items-center gap-0.5 rounded bg-white p-2 transition-colors hover:bg-gray-50'
      >
        <div className='flex h-4 w-4 items-center justify-center'>
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full transition-colors ${
              showMemoOnly ? 'bg-fill-primary-500' : 'bg-fill-secondary-400'
            }`}
          />
        </div>
        <span className='body2-semibold text-text-primary'>메모</span>
      </button>

      <Dropdown options={REFERENCE_POINT_OPTIONS} value={refPoint} onChange={onChangeRefPoint} />
    </div>
  );
}
