import { Icon } from '@knockdog/ui';
import { FILTER_ICON_MAP } from '../config/icon-map';
import { isRegionSuggestion } from '../lib/is';
import { HighlightedText } from './HighlightedText';
import type { Autocomplete, RegionSuggestion, FilterItemSuggestion } from '@entities/kindergarten';

interface AutoCompleteListProps {
  data: Autocomplete;
  query: string;
  onSuggestionClick?: (suggestion: RegionSuggestion | FilterItemSuggestion) => void;
  onPlaceClick?: (shop: { id: string; title: string; roadAddress: string }) => void;
}

export function AutoCompleteList({ data, query, onSuggestionClick, onPlaceClick }: AutoCompleteListProps) {
  const getSuggestionIcon = (suggestion: (typeof data.suggestions)[0]) => {
    if (isRegionSuggestion(suggestion)) return 'Map' as const;
    return FILTER_ICON_MAP[suggestion.code] ?? 'Location';
  };

  if (data.suggestions.length === 0 && data.shops.length === 0) {
    return null;
  }

  return (
    <div className='flex flex-col'>
      {/* 지역/필터 검색어 제안 */}
      {data.suggestions.map((suggestion, index) => (
        <button
          key={`${suggestion.type}-${suggestion.code}-${index}`}
          onClick={() => onSuggestionClick?.(suggestion)}
          className='py-x4 gap-x2 border-primitive-neutral-100 mx-x4 hover:bg-fill-secondary-50 flex w-full items-center border-b text-left'
        >
          <Icon icon={getSuggestionIcon(suggestion)} className='text-fill-secondary-400' />
          <p className='body1-extrabold text-text-primary'>
            <HighlightedText text={suggestion.label} query={query} />
            <span className='text-text-tertiary'> ({suggestion.count}개)</span>
          </p>
        </button>
      ))}

      {/* 업체 검색어 제안 */}
      {data.shops.map((shop) => (
        <button
          key={shop.id}
          onClick={() => onPlaceClick?.({ id: shop.id, title: shop.title, roadAddress: shop.roadAddress })}
          className='py-x4 gap-x2 mx-x4 border-primitive-neutral-100 hover:bg-fill-secondary-50 flex w-full items-center border-b text-left'
        >
          <Icon icon='Location' className='text-fill-secondary-400' />
          <div className='gap-x1 flex flex-1 flex-col text-ellipsis'>
            <p className='body1-extrabold text-text-primary'>
              <HighlightedText text={shop.title} query={query} />
            </p>
            <span className='label-medium text-text-tertiary'>{shop.roadAddress}</span>
          </div>

          <div className='gap-x1 flex flex-col items-end'>
            <span className='label-medium text-text-tertiary'>{shop.ctg}</span>
            <span className='label-medium text-text-tertiary'>{shop.dist.toFixed(1)}km</span>
          </div>
        </button>
      ))}
    </div>
  );
}
