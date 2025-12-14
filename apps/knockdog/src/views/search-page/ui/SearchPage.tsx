import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Icon, TextField, TextFieldInput } from '@knockdog/ui';
import { Header } from '@widgets/Header';
import { AutoCompleteList, RecentlyKeywordList, searchQueryOptions } from '@features/search';
import type { RegionSuggestion, FilterItemSuggestion, AutocompletePlace } from '@entities/kindergarten';
import { useBasePoint } from '@shared/lib';
import { useSearchHistory } from '@shared/store';

export function SearchPage({ inputRef }: { inputRef?: React.RefObject<HTMLInputElement | null> }) {
  const searchParams = useSearchParams();
  const [localQuery, setLocalQuery] = useState(() => searchParams.get('query') ?? '');
  const { coord } = useBasePoint();
  const { data } = useQuery({
    ...searchQueryOptions.autocomplete({ query: localQuery.trim(), coord }),
  });

  const { addRecentSearchKeyword } = useSearchHistory();
  const router = useRouter();

  const handleSuggestionClick = (suggestion: RegionSuggestion | FilterItemSuggestion) => {
    if (suggestion.type === 'REGION') {
      const params = new URLSearchParams(searchParams.toString());
      params.set('query', suggestion.label);
      params.set('scope', 'global');
      params.set('region', suggestion.code);
      params.set('center', `${suggestion.coord.lat},${suggestion.coord.lng}`);
      params.set('zoomLevel', String(suggestion.zoom));
      params.set('bottomSheetSnapIndex', '1');
      // FIXME: searchedLevel, searchLock, bounds는 nuqs 통해 관리되도록 수정 필요 (현재는 버그가 있어서 직접적으로 삭제함)
      params.set('searchedLevel', '1');
      params.delete('searchLock');
      params.delete('bounds');

      addRecentSearchKeyword({
        type: 'REGION',
        label: suggestion.label,
        code: suggestion.code,
        coord: suggestion.coord,
        zoom: suggestion.zoom,
      });

      router.replace(`/?${params.toString()}`);
    } else {
      // FILTER_ITEM 타입 검색
      const params = new URLSearchParams(searchParams.toString());
      params.set('query', suggestion.label);
      params.set('zoomLevel', '9');
      params.set('filters', suggestion.code);
      params.set('scope', 'global');
      params.set('bottomSheetSnapIndex', '1');
      // FIXME: searchedLevel, searchLock, bounds는 nuqs 통해 관리되도록 수정 필요 (현재는 버그가 있어서 직접적으로 삭제함)
      params.set('searchedLevel', '1');
      params.delete('searchLock');
      params.delete('bounds');
      addRecentSearchKeyword({
        type: 'FILTER_ITEM',
        label: suggestion.label,
        code: suggestion.code,
      });

      router.replace(`/?${params.toString()}`);
    }
  };

  const handlePlaceClick = (place: AutocompletePlace) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('query', place.title);
    params.set('center', `${place.coord.lat},${place.coord.lng}`);
    params.set('zoomLevel', '9');
    params.set('scope', 'global');
    params.set('bottomSheetSnapIndex', '1');
    // FIXME: searchedLevel, searchLock, bounds는 nuqs 통해 관리되도록 수정 필요 (현재는 버그가 있어서 직접적으로 삭제함)
    params.set('searchedLevel', '1');
    params.delete('searchLock');
    params.delete('bounds');

    addRecentSearchKeyword({
      type: 'USER_QUERY',
      label: place.title,
    });

    router.replace(`/?${params.toString()}`);
  };

  const handleSubmit = () => {
    if (localQuery.trim()) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('query', localQuery.trim());
      params.set('zoomLevel', '9');
      params.set('scope', 'global');
      params.set('bottomSheetSnapIndex', '1');
      // FIXME: searchedLevel, searchLock, bounds는 nuqs 통해 관리되도록 수정 필요 (현재는 버그가 있어서 직접적으로 삭제함)
      params.set('searchedLevel', '1');
      params.delete('searchLock');
      params.delete('bounds');

      addRecentSearchKeyword({
        type: 'USER_QUERY',
        label: localQuery.trim(),
      });

      router.replace(`/?${params.toString()}`);
    }
  };

  return (
    <div className='flex h-full flex-col'>
      {/* 검색창 헤더 */}
      <Header>
        <Header.LeftSection className='px-4'>
          <Header.BackButton onClick={() => router.back()} />
        </Header.LeftSection>

        <div className='relative min-w-0 flex-1'>
          <TextField
            prefix={<Icon icon='Search' className='size-x6 text-fill-secondary-700' />}
            className='bg-fill-secondary-50 h-x12 min-w-0 border-0'
          >
            <TextFieldInput
              ref={inputRef}
              type='search'
              placeholder='업체 또는 주소를 검색하세요'
              aria-label='검색어 입력'
              autoFocus
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  handleSubmit();
                }
              }}
            />
            {localQuery && (
              <button
                type='button'
                onMouseDown={(e) => {
                  e.preventDefault();
                  setLocalQuery('');
                }}
                aria-label='검색 결과 초기화'
                className='absolute top-1/2 right-4 flex -translate-y-1/2 cursor-pointer items-center justify-center'
              >
                <Icon icon='DeleteInput' className='size-x5 text-primitive-neutral-700' />
              </button>
            )}
          </TextField>
        </div>
      </Header>

      <main className='flex-1 overflow-y-auto'>
        {localQuery.trim() && data ? (
          <AutoCompleteList
            data={data}
            query={localQuery}
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
