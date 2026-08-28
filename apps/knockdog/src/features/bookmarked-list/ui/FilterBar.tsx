import type { FilterState } from '../model/filterState';
import { resolveAddressAlias, useUserStore } from '@entities/user';
import type { ReferencePointType } from '@entities/compare';
import { Dropdown } from '@shared/ui/dropdown';

export function FilterBar({ refPoint, onChangeRefPoint, showMemoOnly, onMemoToggle }: FilterState) {
  const user = useUserStore((state) => state.user);
  const savedAddresses = user?.addresses;

  const refPointOptions = (savedAddresses ?? [])
    .filter((addr) => !!addr.alias)
    .map(({ type, alias }) => {
      const label = resolveAddressAlias(type, alias);
      return {
        value: type as ReferencePointType,
        label,
        displayLabel: `거리기준: ${label}`,
      };
    });

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

      <Dropdown options={refPointOptions} value={refPoint} onChange={onChangeRefPoint} />
    </div>
  );
}
