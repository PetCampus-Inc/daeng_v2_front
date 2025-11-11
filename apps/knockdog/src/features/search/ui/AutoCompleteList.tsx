import { Icon } from '@knockdog/ui';
import { formatDistance } from '@shared/lib';
import { FILTER_ICON_MAP } from '../config/icon-map';
import { isRegionSuggestion } from '../lib/is';
import { HighlightedText } from './HighlightedText';
import type { Autocomplete, RegionSuggestion, FilterItemSuggestion, Place } from '@entities/kindergarten';

interface AutoCompleteListProps {
  data: Autocomplete;
  query: string;
  onSuggestionClick?: (suggestion: RegionSuggestion | FilterItemSuggestion) => void;
  onPlaceClick?: (place: Place) => void;
}

export function AutoCompleteList({ data, query, onSuggestionClick, onPlaceClick }: AutoCompleteListProps) {
  const getSuggestionIcon = (suggestion: (typeof data.suggestion)[0]) => {
    if (isRegionSuggestion(suggestion)) return 'Map' as const;
    return FILTER_ICON_MAP[suggestion.code] ?? 'Location';
  };

  if (data.suggestion.length === 0 && data.place.length === 0) {
    return null;
  }

  return (
    <section className='flex flex-col' aria-label='검색 자동완성'>
      {data.suggestion.length > 0 && (
        <ul className='flex flex-col'>
          {data.suggestion.map((suggestion, index) => (
            <li key={`${suggestion.type}-${suggestion.code}-${index}`}>
              <button
                onClick={() => onSuggestionClick?.(suggestion)}
                className='px-x4 hover:rounded-r2 hover:bg-fill-secondary-50 w-full text-left'
              >
                <div className='gap-x2 border-primitive-neutral-100 py-x4 flex w-full items-center border-b'>
                  <Icon icon={getSuggestionIcon(suggestion)} className='text-fill-secondary-400' />
                  <p className='body1-extrabold text-text-primary'>
                    <HighlightedText text={suggestion.label} query={query} />
                    <span className='text-text-tertiary'> ({suggestion.count}개)</span>
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {data.place.length > 0 && (
        <ul className='flex flex-col'>
          {data.place.map((place) => (
            <li key={place.id}>
              <button
                onClick={() => onPlaceClick?.(place)}
                className='px-x4 hover:rounded-r2 hover:bg-fill-secondary-50 w-full text-left'
              >
                <div className='gap-x2 border-primitive-neutral-100 py-x4 flex w-full items-center border-b'>
                  <Icon icon='Location' className='text-fill-secondary-400 shrink-0' />

                  <div className='gap-x1 flex min-w-0 shrink-0 grow flex-col overflow-hidden'>
                    <p className='body1-extrabold text-text-primary truncate'>
                      <HighlightedText text={place.title} query={query} />
                    </p>
                    <span className='label-medium text-text-tertiary truncate'>{place.roadAddress}</span>
                  </div>

                  <div className='gap-x1 flex min-w-0 shrink flex-col overflow-hidden text-right'>
                    <span className='label-medium text-text-tertiary truncate'>{place.ctg}</span>
                    <span className='label-medium text-text-tertiary whitespace-nowrap'>
                      {formatDistance(place.dist)}
                    </span>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
