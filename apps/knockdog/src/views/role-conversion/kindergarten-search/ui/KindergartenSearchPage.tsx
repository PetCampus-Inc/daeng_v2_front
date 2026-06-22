'use client';

import { Icon, ProgressBar, TextField, TextFieldInput } from '@knockdog/ui';
import { Header } from '@widgets/Header';

import { roleConversionProgress } from '@views/role-conversion/config/roleConversionProgress';
import { kindergartenSearchContent } from '../config/kindergartenSearchContent';
import { useKindergartenSearchPage } from '../model/useKindergartenSearchPage';
import { KindergartenSearchEmptyResult } from './KindergartenSearchEmptyResult';
import { KindergartenSearchHint } from './KindergartenSearchHint';
import { KindergartenSearchPlaceList } from './KindergartenSearchPlaceList';

function KindergartenSearchPage() {
  const { query, places, selectedPlaceId, isSearchEmpty, handleQueryChange, handlePlaceSelect } =
    useKindergartenSearchPage();
  const hasQuery = query.trim().length > 0;

  return (
    <div className='flex h-full flex-col'>
      <Header>
        <Header.BackButton />
        <Header.Title>{kindergartenSearchContent.headerTitle}</Header.Title>
      </Header>

      <div className='shrink-0 px-4 py-2'>
        <ProgressBar
          totalSteps={roleConversionProgress.totalSteps}
          value={roleConversionProgress.kindergartenSearchStep}
          className='h-1.5'
        />
      </div>

      <div className='flex min-h-0 flex-1 flex-col px-4 pt-3 pb-5'>
        <div className='flex shrink-0 flex-col gap-5'>
          <h1 className='h1-extrabold'>
            {kindergartenSearchContent.titleLine1}
            <br />
            {kindergartenSearchContent.titleLine2}
          </h1>

          <div className='relative min-w-0'>
            <TextField
              prefix={<Icon icon='Search' className='size-x6 text-fill-secondary-700' />}
              className='bg-fill-secondary-50 h-x12 min-w-0 border-0'
            >
              <TextFieldInput
                type='search'
                placeholder={kindergartenSearchContent.searchPlaceholder}
                aria-label='유치원 검색어 입력'
                autoFocus
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
              />
              {query && (
                <button
                  type='button'
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleQueryChange('');
                  }}
                  aria-label='검색어 초기화'
                  className='absolute top-1/2 right-4 flex -translate-y-1/2 cursor-pointer items-center justify-center'
                >
                  <Icon icon='DeleteInput' className='size-x5 text-primitive-neutral-700' />
                </button>
              )}
            </TextField>
          </div>

          {!hasQuery && <KindergartenSearchHint />}
          {isSearchEmpty && <KindergartenSearchEmptyResult />}
        </div>

        <div className='scrollbar-hide min-h-0 flex-1 overflow-y-auto pt-4'>
          {hasQuery && places.length > 0 && (
            <KindergartenSearchPlaceList
              places={places}
              query={query}
              selectedPlaceId={selectedPlaceId}
              onPlaceSelect={handlePlaceSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export { KindergartenSearchPage };
