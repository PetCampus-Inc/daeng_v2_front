import { Fragment, useEffect, useMemo, useRef } from 'react';
import { Float, FloatingActionButton, Icon, SegmentedControl, SegmentedControlItem } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { useSearchFilter } from '../model/useSearchFilter';
import { useFabExtension } from '../model/useFabExtension';
import { inferSearchKindFromUrl, type UrlSearchKind } from '../model/searchKind';
import { KindergartenListItem } from './KindergartenListItem';
import { SortSelect } from './SortSelect';
import { FilterChip } from './FilterChip';
import { useListOptionsUrlState } from '../model/useListOptionsUrlState';
import { PermissionSection } from './PermissionSection';
import { NearByRecommendBanner } from './NearByRecommendBanner';
import { useBookmarkToggle } from '../model/useBookmarkToggle';
import { useSearchListQuery, useSearchMachine } from '@features/kindergarten-map';
import { useSearchUrlState } from '@features/kindergarten-map/model/useSearchUrlState';
import { FILTER_OPTIONS, SHORT_CUT_FILTER_OPTIONS } from '@entities/kindergarten';
import { getCurrentLocation, isNativeWebView, useBottomSheetSnapIndex } from '@shared/lib';
import { BOTTOM_BAR_HEIGHT } from '@shared/constants';
import { useBasePointType, useSearchListScroll } from '@shared/store';

interface KindergartenListProps {
  onOpenFilter: () => void;
  region?: string | null;
}

export function KindergartenList({ onOpenFilter, region }: KindergartenListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { query: searchQuery, filters } = useSearchUrlState();
  const { rank } = useListOptionsUrlState();
  const { dispatch } = useSearchMachine();
  const { selectedBaseType, setBaseType } = useBasePointType();
  const { isFullExtended, setSnapIndex } = useBottomSheetSnapIndex();

  const { getSelectedFilterWithLabel, onToggleOption, isSelectedOption, isEmptyFilters } = useSearchFilter();
  const { isFabExtended, sentinelRef } = useFabExtension(containerRef);

  const { listQuery, searchListQueryKey, searchList, listWithoutExact, exact } = useSearchListQuery({ rank });
  const { onBookmarkClick } = useBookmarkToggle(searchListQueryKey);

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = listQuery;
  const totalCount = listQuery.data?.pages[0]?.schoolResult.totalCount || 0;

  const selectedFilters = getSelectedFilterWithLabel();
  const { scrollTop, setScrollTop } = useSearchListScroll();

  const searchKind: UrlSearchKind = useMemo(
    () => inferSearchKindFromUrl({ query: searchQuery, filters, region }),
    [searchQuery, filters, region]
  );

  useEffect(() => {
    if (filters.length > 0) {
      dispatch({ type: 'FILTERS_CHANGED', filters });
      return;
    }
    dispatch({ type: 'CLEAR_FILTERS' });
  }, [filters]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [setScrollTop]);

  useEffect(() => {
    if (!isFullExtended) return;
    const container = containerRef.current;
    if (!container) return;
    container.scrollTop = scrollTop;
  }, [isFullExtended, scrollTop]);

  useEffect(() => {
    const root = isFullExtended ? containerRef.current : null;
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (!hasNextPage || isFetchingNextPage) return;
        fetchNextPage();
      },
      {
        root,
        rootMargin: '0px 0px 30% 0px',
        threshold: 0,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasNextPage, isFetchingNextPage]);

  // const isGranted = useMemo(async () => {
  //   const status = await getCurrentLocation.getPermission();
  //   return status === 'allowed';
  // }, []);

  const handleLocationChange = (value: string) => {
    setBaseType(value as 'current' | 'home' | 'work');
  };

  return (
    <>
      <main
        ref={containerRef}
        data-search-kind={searchKind}
        className={cn(
          !isNativeWebView() && 'pb-[68px]',
          'scrollbar-hide relative flex h-full w-full flex-col',
          isFullExtended ? 'overflow-y-auto' : 'min-h-full overflow-hidden'
        )}
      >
        {/* 스크롤 감지용 sentinel 요소 */}
        <div ref={sentinelRef} className='pointer-events-none absolute top-0 h-1 w-full' aria-hidden='true' />

        {/* 헤더 영역  */}
        <div className='bg-bg-0 sticky top-[-.5px] z-20'>
          <div className='px-x4 pb-x4 pt-x2'>
            <SegmentedControl defaultValue={selectedBaseType} onValueChange={handleLocationChange}>
              <SegmentedControlItem value='current'>현 위치</SegmentedControlItem>
              <SegmentedControlItem value='home'>집</SegmentedControlItem>
              <SegmentedControlItem value='work'>직장</SegmentedControlItem>
            </SegmentedControl>
          </div>

          <div className='border-line-200 flex h-[52px] w-full items-center border-t border-b'>
            <div className='py-x2 flex w-full items-center'>
              {/* 고정 버튼 영역 */}
              <div className='pl-x4 flex shrink-0 items-center gap-x-2'>
                <button
                  className={`gap-x0.5 radius-full px-x3 py-x2 body2-semibold flex shrink-0 cursor-pointer items-center outline-[1.5] outline-offset-[-1.5px] ${
                    isEmptyFilters
                      ? 'outline-line-200 bg-fill-secondary-0 text-text-primary'
                      : 'outline-line-accent bg-fill-primary-50 text-text-accent'
                  }`}
                  onClick={onOpenFilter}
                >
                  <Icon
                    icon='Filter'
                    className={`size-x4 ${isEmptyFilters ? 'text-fill-secondary-700' : 'text-fill-primary-500'}`}
                  />
                  필터
                  {!isEmptyFilters && (
                    <span className='body2-extrabold text-text-accent'>{selectedFilters.length}</span>
                  )}
                </button>

                {/* 구분선 */}
                <div className='bg-line-200 h-[14px] w-px shrink-0' />
              </div>

              {/* 스크롤 영역 */}
              <div className='scrollbar-hide flex-1 touch-pan-x overflow-x-auto'>
                <div className='before:w-x2 after:w-x2 inline-flex items-center whitespace-nowrap before:shrink-0 before:content-[""] after:shrink-0 after:content-[""]'>
                  {/* 바로가기 필터 칩들 */}
                  {SHORT_CUT_FILTER_OPTIONS.map((option) => {
                    const optionLabel = FILTER_OPTIONS[option];
                    const isSelected = isSelectedOption(option);

                    return (
                      <FilterChip
                        variant='status'
                        key={option}
                        activated={isSelected}
                        onClick={() => onToggleOption(option)}
                      >
                        {optionLabel}
                      </FilterChip>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <DogSchoolEmptySection /> */}
        {/* {!isGranted && <PermissionSection />} */}
        {/* 컨텐츠 영역  */}
        <div className='flex-1'>
          <div className='border-line-200 px-x4 py-x2 flex h-[52px] items-center justify-between border-b'>
            <div className='body2-semibold text-text-tertiary'>총 {totalCount}개</div>
            <SortSelect />
          </div>

          {exact && (
            <>
              <KindergartenListItem {...exact} onBookmarkClick={onBookmarkClick} />
              <NearByRecommendBanner title={exact.title} />
            </>
          )}
          {(listWithoutExact ?? searchList).map((item) => (
            <Fragment key={item.id}>
              <KindergartenListItem {...item} banner={item.banner ?? []} onBookmarkClick={onBookmarkClick} />
              <hr className='bg-line-100 text-line-100 h-[8px] w-full' />
            </Fragment>
          ))}
        </div>
        <div ref={loadMoreRef} aria-hidden className='h-4' />
      </main>

      {/* 지도보기 FAB */}
      <Float
        placement='bottom-end'
        offsetX='x4'
        zIndex={50}
        style={{
          bottom: isNativeWebView() ? '12px' : `calc(${BOTTOM_BAR_HEIGHT}px + 12px`,
        }}
      >
        <FloatingActionButton
          className='max-w-[103px]'
          variant='neutralLight'
          label='지도보기'
          size='medium'
          icon='Map'
          onClick={() => setSnapIndex(0)}
          extended={isFabExtended}
        />
      </Float>
    </>
  );
}
