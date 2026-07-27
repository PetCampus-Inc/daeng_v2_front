'use client';

import { Field, FieldLabel, Icon, ProgressBar, TextField, TextFieldInput } from '@knockdog/ui';
import { Header } from '@widgets/Header';

import { roleConversionProgress } from '@views/role-conversion/config/roleConversionProgress';
import { kindergartenSearchContent } from '@views/role-conversion/kindergarten-search/config/kindergartenSearchContent';
import { useKindergartenSearchPage } from '@views/role-conversion/kindergarten-search/model/useKindergartenSearchPage';
import { KindergartenSearchEmptyResult } from './KindergartenSearchEmptyResult';
import { KindergartenSearchHint } from './KindergartenSearchHint';
import { KindergartenSearchPlaceList } from './KindergartenSearchPlaceList';

function KindergartenSearchPage() {
  const {
    query,
    places,
    selectedPlaceId,
    isSearchEmpty,
    isPlaceSelectPending,
    handleQueryChange,
    handlePlaceSelect,
  } = useKindergartenSearchPage();
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

      {/* 키보드 올라와도 리스트가 보이도록 타이틀·인풋·리스트를 한 스크롤로 합침 */}
      <div className='min-h-0 flex-1 overflow-y-auto px-4 pt-3 pb-5'>
        <div className='flex flex-col gap-5'>
          <h1 className='h1-extrabold'>
            {kindergartenSearchContent.titleLine1}
            <br />
            {kindergartenSearchContent.titleLine2}
          </h1>

          <Field className='flex-col gap-2'>
            <FieldLabel className='body2-bold text-text-primary w-fit'>
              {kindergartenSearchContent.addressLabel}
            </FieldLabel>

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
              </TextField>
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
            </div>
          </Field>

          {!hasQuery && <KindergartenSearchHint />}
          {isSearchEmpty && <KindergartenSearchEmptyResult />}
        </div>

        {hasQuery && places.length > 0 && (
          <div className='pt-4'>
            <KindergartenSearchPlaceList
              places={places}
              query={query}
              selectedPlaceId={selectedPlaceId}
              isPlaceSelectPending={isPlaceSelectPending}
              onPlaceSelect={handlePlaceSelect}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export { KindergartenSearchPage };
