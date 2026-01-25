import { Fragment, useEffect, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Float,
  FloatingActionButton,
  Icon,
  SegmentedControl,
  SegmentedControlItem,
} from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { useSearchFilter } from '../model/useSearchFilter';
import { useFabExtension } from '../model/useFabExtension';
import { KindergartenListItem } from './KindergartenListItem';
import { SortSelect } from './SortSelect';
import { FilterChip } from './FilterChip';
import { PermissionSection } from './PermissionSection';
import { NoSearchResultSection } from './NoSearchResultSection';
import { NearByRecommendBanner } from './NearByRecommendBanner';
import { useListBookmarkToggle } from '../model/useListBookmarkToggle';
import { overlay } from 'overlay-kit';
import { useFilteredSearchList } from '@features/kindergarten-map';
import { FILTER_OPTIONS, SHORT_CUT_FILTER_OPTIONS } from '@entities/kindergarten';
import { useUserStore, USER_ADDRESS_TYPE, USER_ADDRESS_TYPE_KR } from '@entities/user';
import { LocationPermissionError, useBottomSheetSnapIndex } from '@shared/lib';
import { useGeolocationQuery } from '@shared/lib/geolocation/useGeolocationQuery';
import { type BasePointType, useBasePointType } from '@shared/store';
import { useStackNavigation } from '@shared/lib/bridge';
import { route } from '@shared/constants/route';
import { ellipsisText, tokenUtils } from '@shared/utils';

interface KindergartenListProps {
  region?: string | null;
  onOpenFilter: () => void;
}

export function KindergartenList({ onOpenFilter, region }: KindergartenListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { selectedBaseType, setBaseType } = useBasePointType();
  const { isFullExtended, setSnapIndex } = useBottomSheetSnapIndex();
  const { push } = useStackNavigation();
  const user = useUserStore((s) => s.user);
  const isLoggedIn = !!user || tokenUtils.hasAccessToken();

  const { getSelectedFilterWithLabel, onToggleOption, isSelectedOption, isEmptyFilters } = useSearchFilter();
  const { isFabExtended, sentinelRef } = useFabExtension(containerRef);

  const { listQuery, searchListQueryKey, searchList, exact, totalCount } = useFilteredSearchList();
  const { mutate } = useListBookmarkToggle(searchListQueryKey);

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = listQuery;

  const selectedFilters = getSelectedFilterWithLabel();

  // 위치 권한 에러 체크
  const { error: locationError } = useGeolocationQuery({ enabled: selectedBaseType === 'CURRENT' });
  const isPermissionDenied = selectedBaseType === 'CURRENT' && locationError instanceof LocationPermissionError;

  const workAlias = user?.addresses?.find((addr) => addr.type === USER_ADDRESS_TYPE.WORK)?.alias || USER_ADDRESS_TYPE_KR[USER_ADDRESS_TYPE.WORK];

  const handleBasePointTypeChange = (value: string) => {
    const newType = value as BasePointType;

    // 비로그인 사용자 체크
    if (!isLoggedIn) {
      if (newType !== 'CURRENT') {
        push({ pathname: route.auth.login.root });
        return;
      }
    }

    // 직장 선택 시 등록된 직장 있는지 체크
    if (newType === 'WORK') {
      if (!user) return;
      const hasWorkAddress = user?.addresses?.some((addr) => addr.type === USER_ADDRESS_TYPE.WORK);
      if (!hasWorkAddress) {
        handleOpenAlertDialog();
        return;
      }
    }

    setBaseType(newType);
  };

  const handleOpenAlertDialog = () =>
    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>등록된 직장 위치가 없어요!</AlertDialogTitle>
            <AlertDialogDescription>
              새로운 위치 추가는 마이 {'>'} 내 장소 관리에서 가능해요! 지금 직장 위치를 등록하러 갈까요?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={close}>나중에</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                close();
                push({ pathname: route.mypage.profile.location.root });
              }}
            >
              등록하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));

  const handleBookmarkClick = (id: string, bookmarked: boolean) => {
    mutate({ id, bookmarked });
  };

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

  return (
    <>
      <main
        id="test-id"
        ref={containerRef}
        className={cn(
          'scrollbar-hide relative flex h-full w-full flex-col',
          isFullExtended ? 'overflow-y-auto' : 'min-h-full overflow-hidden'
        )}
      >
        {/* 스크롤 감지용 sentinel 요소 */}
        <div ref={sentinelRef} className='pointer-events-none absolute top-0 h-1 w-full' aria-hidden='true' />

        {/* 헤더 영역  */}
        <div className='bg-bg-0 sticky top-[-.5px] z-20'>
          <div className='px-x4 pb-x4 pt-x2'>
            <SegmentedControl value={selectedBaseType} onValueChange={handleBasePointTypeChange}>
              <SegmentedControlItem value='CURRENT'>현 위치</SegmentedControlItem>
              <SegmentedControlItem value='HOME'>집</SegmentedControlItem>
              <SegmentedControlItem value='WORK'>{ellipsisText(workAlias, 8)}</SegmentedControlItem>
            </SegmentedControl>
          </div>

          <div className='border-line-200 flex h-[52px] w-full items-center border-t border-b'>
            <div className='py-x2 flex w-full items-center'>
              {/* 고정 버튼 영역 */}
              <div className='pl-x4 flex shrink-0 items-center gap-x-2'>
                <button
                  className={`gap-x0.5 radius-full px-x3 py-x2 body2-semibold flex shrink-0 cursor-pointer items-center outline-[1.5] outline-offset-[-1.5px] ${isEmptyFilters
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

        {/* 컨텐츠 영역 */}
        {isPermissionDenied ? (
          <PermissionSection />
        ) : totalCount === 0 && !listQuery.isLoading ? (
          <NoSearchResultSection />
        ) : (
          <div className='flex-1'>
            <div className='border-line-200 px-x4 py-x2 flex h-[52px] items-center justify-between border-b'>
              <div className='body2-semibold text-text-tertiary'>총 {totalCount}개</div>
              <SortSelect />
            </div>

            {exact && (
              <>
                <KindergartenListItem {...exact} onBookmarkClick={handleBookmarkClick} />
                <NearByRecommendBanner title={exact.title} />
              </>
            )}
            {searchList.map((item) => (
              <Fragment key={item.id}>
                <KindergartenListItem {...item} banner={item.banner ?? []} onBookmarkClick={handleBookmarkClick} />
                <hr className='bg-line-100 text-line-100 h-[8px] w-full' />
              </Fragment>
            ))}
          </div>
        )}
        <div ref={loadMoreRef} aria-hidden='true' className='h-4' />
      </main>

      {/* 지도보기 FAB */}
      <Float
        placement='bottom-end'
        offsetX='x4'
        zIndex={50}
        style={{
          bottom: '12px',
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
