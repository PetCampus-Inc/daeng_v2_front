import { Icon, TextField, TextFieldInput } from '@knockdog/ui';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { AutoCompleteList, RecentlyKeywordList, searchQueryOptions } from '@features/search';
import type { RegionSuggestion, FilterItemSuggestion } from '@entities/kindergarten';
import { useBasePoint } from '@shared/lib';
import { useSearchHistory } from '@shared/store';

export function SearchPage({ inputRef }: { inputRef?: React.RefObject<HTMLInputElement | null> }) {
  const [query, setQuery] = useState('');
  const { coord } = useBasePoint();
  const { data } = useQuery({
    ...searchQueryOptions.autocomplete({ query: query.trim(), lat: coord?.lat, lng: coord?.lng }),
  });

  const { addRecentSearchKeyword, addRecentView } = useSearchHistory();

  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleSuggestionClick = useCallback(
    (suggestion: RegionSuggestion | FilterItemSuggestion) => {
      if (suggestion.type === 'REGION') {
        addRecentSearchKeyword({
          type: 'REGION',
          label: suggestion.label,
          code: suggestion.code,
          coord: suggestion.coord,
          zoom: suggestion.zoom,
        });
      } else {
        addRecentSearchKeyword({
          type: 'FILTER_ITEM',
          label: suggestion.label,
          code: suggestion.code,
        });
      }
      // TODO: 검색 결과 페이지로 이동
    },
    [addRecentSearchKeyword]
  );

  const handlePlaceClick = useCallback(
    (shop: { id: string; title: string; roadAddress: string }) => {
      addRecentView({
        id: shop.id,
        label: shop.title,
        address: shop.roadAddress,
      });
      // TODO: 상세 페이지로 이동
    },
    [addRecentView]
  );

  const handleSubmit = useCallback(() => {
    if (query.trim()) {
      addRecentSearchKeyword({
        type: 'USER_QUERY',
        label: query.trim(),
      });
      // TODO: 검색 결과 페이지로 이동
    }
  }, [query, addRecentSearchKeyword]);

  return (
    <div className='bg-fill-secondary-0 flex h-full flex-col'>
      {/* 검색창 헤더 */}
      <div className='py-x2 pr-x4 pl-x2 gap-x-x2 pt-[calc(env(safe-area-inset-top) + 8px)] flex shrink-0'>
        <button onClick={handleBack} className='px-x2 shrink-0'>
          <Icon icon='ChevronLeft' className='size-x6' />
        </button>
        <div className='relative flex-1'>
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
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
            />
            {query && (
              <button
                type='button'
                onClick={() => setQuery('')}
                aria-label='검색 결과 초기화'
                className='absolute right-4 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center'
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
