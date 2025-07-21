import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@knockdog/ui/lib';
import { Float, Icon } from '@knockdog/ui';
import { ListFAB, CurrentLocationFAB, Map, RefreshFAB } from '@features/map';
import { DogSchoolCardSheet, DogSchoolListSheet } from '@features/dog-school';
import { getCombinedMockData } from '@entities/dog-school';
import { useMarkerState } from '@shared/store';
import { useBottomSheetSnapIndex } from '@shared/lib';

export function MapWithSchools() {
  const data = getCombinedMockData();
  const searchParams = useSearchParams();

  const { activeMarkerId, setActiveMarker } = useMarkerState();
  const { isFullExtended, setSnapIndex } = useBottomSheetSnapIndex();

  const handleMarkerClick = (id: string) => {
    setActiveMarker(id);
  };

  const handleBottomSheetClose = (isOpen: boolean) => {
    if (!isOpen) {
      setActiveMarker(null);
    }
  };

  // 선택된 업체 정보 찾기
  const selectedShop = activeMarkerId
    ? data.shops.find((shop) => shop.id === activeMarkerId)
    : data.shops[0];

  return (
    <>
      <Map
        onMarkerClick={handleMarkerClick}
        selectedMarkerId={activeMarkerId}
      />
      {/* 지도 배경 오버레이 */}
      <div className='bg-primitive-neutral-50/12 pointer-events-none absolute top-0 z-2 h-full w-full touch-none' />

      <div
        className={cn(
          'px-x4 pb-x2 absolute top-0 z-50 w-full pt-[calc(env(safe-area-inset-top)+16px)] transition-colors ease-out',
          isFullExtended && 'bg-fill-secondary-0'
        )}
      >
        <Link
          href={`/search${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
        >
          <div className='radius-r2 border-line-600 bg-fill-secondary-0 px-x4 flex h-[48px] items-center border'>
            <Icon
              icon='Search'
              className='size-x5 text-fill-secondary-700 mr-x2'
            />
            <div
              role='button'
              aria-label='검색창 열기'
              className='text-text-tertiary body1-regular flex-1'
            >
              업체 또는 주소를 검색하세요
            </div>
          </div>
        </Link>
      </div>

      {/* chips */}
      <div className='px-x4 gap-x2 absolute top-[calc(env(safe-area-inset-top)+72px)] z-20 flex w-full'>
        <button className='radius-r2 py-x2 px-x3_5 gap-x1 border-line-200 bg-fill-secondary-700 body2-semibold text-text-primary-inverse flex shrink-0 items-center border-[1.4px]'>
          <Icon
            icon='Note'
            className='text-fill-primary-500 size-x4 inline-flex items-center justify-center'
          />
          메모
        </button>
        <button className='radius-r2 py-x2 px-x3_5 gap-x1 border-line-200 bg-fill-secondary-700 body2-semibold text-text-primary-inverse flex shrink-0 items-center border-[1.4px]'>
          <Icon
            icon='BookmarkFill'
            className='text-fill-primary-500 inline-flex size-[16.8px] items-center justify-center'
          />
          북마크
        </button>
      </div>

      <DogSchoolListSheet
        fabSlot={
          <div className='px-x4 absolute -top-[50px] flex w-full items-center justify-center'>
            <Float placement='top-start' offsetX='x4'>
              <CurrentLocationFAB />
            </Float>
            <RefreshFAB />
            <Float placement='top-end' offsetX='x4'>
              <ListFAB onClick={() => setSnapIndex(2)} />
            </Float>
          </div>
        }
      />
      <DogSchoolCardSheet
        isOpen={!!activeMarkerId}
        onChangeOpen={handleBottomSheetClose}
        {...(selectedShop || data.shops[0]!)}
      />
    </>
  );
}
