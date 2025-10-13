import { Icon } from '@knockdog/ui';
import { FILTER_ICON_MAP } from '../config/icon-map';
import { isRegionSuggestion } from '../lib/is';
import { HighlightedText } from './HighlightedText';
import type { Autocomplete } from '@entities/kindergarten';

interface AutoCompleteListProps {
  data: Autocomplete;
  query: string;
}

export function AutoCompleteList({ data, query }: AutoCompleteListProps) {
  const getSuggestionIcon = (suggestion: (typeof data.suggestions)[0]) => {
    if (isRegionSuggestion(suggestion)) return 'Map' as const;
    return FILTER_ICON_MAP[suggestion.code];
  };

  if (data.suggestions.length === 0 && data.shops.length === 0) {
    return null;
  }

  return (
    <div className='flex flex-col'>
      {/* 지역/필터 검색어 제안 */}
      {data.suggestions.map((suggestion, index) => (
        <div
          key={`${suggestion.type}-${suggestion.code}-${index}`}
          className='py-x4 gap-x2 border-primitive-neutral-100 mx-x4 flex items-center border-b'
        >
          <Icon icon={getSuggestionIcon(suggestion)} className='text-fill-secondary-400' />
          <p className='body1-extrabold text-text-primary'>
            <HighlightedText text={suggestion.label} query={query} />
            <span className='text-text-tertiary'> ({suggestion.count}개)</span>
          </p>
        </div>
      ))}

      {/* 업체 검색어 제안 */}
      {data.shops.map((shop) => (
        <div key={shop.id} className='py-x4 gap-x2 mx-x4 border-primitive-neutral-100 flex items-center border-b'>
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
        </div>
      ))}
    </div>
  );
}
