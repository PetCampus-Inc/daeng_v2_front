import type { AutocompletePlace } from '@entities/kindergarten';
import { HighlightedText } from '@features/search/ui/HighlightedText';
import { cn } from '@knockdog/ui/lib';

import { kindergartenSearchContentInset } from '../config/kindergartenSearchContentInset';

interface KindergartenSearchPlaceListProps {
  places: AutocompletePlace[];
  query: string;
  selectedPlaceId: string | null;
  onPlaceSelect: (place: AutocompletePlace) => void;
}

function KindergartenSearchPlaceList({
  places,
  query,
  selectedPlaceId,
  onPlaceSelect,
}: KindergartenSearchPlaceListProps) {
  if (places.length === 0) return null;

  return (
    <ul className={cn('flex flex-col', kindergartenSearchContentInset)}>
      {places.map((place) => (
        <li key={place.id}>
          <button
            type='button'
            onClick={() => onPlaceSelect(place)}
            className={cn(
              'hover:rounded-r2 hover:bg-fill-secondary-50 w-full text-left',
              selectedPlaceId === place.id && 'bg-fill-secondary-50 rounded-r2'
            )}
          >
            <div className='gap-x2 border-primitive-neutral-100 py-x4 flex w-full items-center border-b px-0'>
              <div className='gap-x1 flex min-w-0 shrink-0 grow flex-col overflow-hidden'>
                <p className='body2-semibold text-text-primary truncate'>
                  <HighlightedText text={place.title} query={query} />
                </p>
                <span className='label-medium text-text-tertiary truncate'>{place.roadAddress}</span>
              </div>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

export { KindergartenSearchPlaceList };
