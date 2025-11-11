import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Icon, TextField, TextFieldInput } from '@knockdog/ui';
import { AutoCompleteList, RecentlyKeywordList, searchQueryOptions } from '@features/search';
import { useBasePoint } from '@shared/lib';
import { useSearchHistory } from '@shared/store';
import type { RegionSuggestion, FilterItemSuggestion, Place } from '@entities/kindergarten';

export function SearchPage({ inputRef }: { inputRef?: React.RefObject<HTMLInputElement | null> }) {
  const [query, setQuery] = useState('');
  const { coord } = useBasePoint();
  const { data } = useQuery({
    ...searchQueryOptions.autocomplete({ query: query.trim(), coord }),
  });

  const { addRecentSearchKeyword, addRecentView } = useSearchHistory();

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleBack = () => {
    router.back();
  };

  const handleSuggestionClick = (suggestion: RegionSuggestion | FilterItemSuggestion) => {
    if (suggestion.type === 'REGION') {
      addRecentSearchKeyword({
        type: 'REGION',
        label: suggestion.label,
        code: suggestion.code,
        coord: suggestion.coord,
        zoom: suggestion.zoom,
      });

      const params = new URLSearchParams(searchParams?.toString());
      params.set('query', suggestion.label);
      params.set('center', `${suggestion.coord.lng},${suggestion.coord.lat}`);
      params.set('zoom', String(suggestion.zoom));
      router.replace(`/?${params.toString()}`);
    } else {
      addRecentSearchKeyword({
        type: 'FILTER_ITEM',
        label: suggestion.label,
        code: suggestion.code,
      });

      const params = new URLSearchParams(searchParams?.toString());
      params.set('query', suggestion.label);
      params.set('filters', suggestion.code);
      router.replace(`/?${params.toString()}`);
    }
  };

  const handlePlaceClick = (place: Place) => {
    addRecentView({
      id: place.id,
      label: place.title,
      address: place.roadAddress,
    });

    const params = new URLSearchParams(searchParams?.toString());
    params.set('query', place.title);
    params.set('center', `${place.coord.lat},${place.coord.lng}`);
    router.replace(`/?${params.toString()}`);
  };

  const handleSubmit = () => {
    if (query.trim()) {
      addRecentSearchKeyword({
        type: 'USER_QUERY',
        label: query.trim(),
      });

      const params = new URLSearchParams(searchParams?.toString());
      params.set('query', query.trim());
      router.replace(`/?${params.toString()}`);
    }
  };

  return (
    <div className='flex h-full flex-col'>
      {/* 검색창 헤더 */}
      <div className='py-x2 pr-x4 pl-x2 gap-x-x2 flex shrink-0'>
        <button onClick={handleBack} className='px-x2 shrink-0'>
          <Icon icon='ChevronLeft' className='size-x6' />
        </button>
        <div className='relative min-w-0 flex-1'>
          <TextField
            prefix={<Icon icon='Search' className='size-x6 text-fill-secondary-700' />}
            className='bg-fill-secondary-50 h-x12 border-0'
          >
            <TextFieldInput
              ref={inputRef}
              type='search'
              placeholder='업체 또는 주소를 검색하세요'
              aria-label='검색어 입력'
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  handleSubmit();
                }
              }}
            />
            {query && (
              <button
                type='button'
                onMouseDown={(e) => {
                  e.preventDefault();
                  setQuery('');
                }}
                aria-label='검색 결과 초기화'
                className='absolute top-1/2 right-4 flex -translate-y-1/2 cursor-pointer items-center justify-center'
              >
                <Icon icon='DeleteInput' className='size-x5 text-primitive-neutral-700' />
              </button>
            )}
          </TextField>
        </div>
      </div>

      <main className='flex-1 overflow-y-auto'>
        {query.trim() && data ? (
          <AutoCompleteList
            data={data}
            query={query}
            onSuggestionClick={handleSuggestionClick}
            onPlaceClick={handlePlaceClick}
          />
        ) : (
          <RecentlyKeywordList />
        )}
      </main>
    </div>
  );
}
