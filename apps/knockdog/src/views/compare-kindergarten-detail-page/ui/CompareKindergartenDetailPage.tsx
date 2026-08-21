'use client';

import { useRef, useEffect } from 'react';
import { Divider, IconButton } from '@knockdog/ui';
import { useParams } from 'next/navigation';

import { KindergartenTabs } from '@widgets/kindergarten-tabs';
import { Header } from '@widgets/Header';
import { SelectActionButtons } from '@widgets/compare-list';
import { useKindergartenMainQuery, KindergartenMainBox, MainBannerSwiper } from '@features/kindergarten-main';
import type { SelectedIds } from '@entities/compare/model/compare';
import { isSelectedIds } from '@entities/compare';
import { useCurrentLocation } from '@shared/lib/geolocation';
import { SafeArea } from '@shared/ui/safe-area';
import { useStackNavigation } from '@shared/lib/bridge';
import { useCompareStore } from '@shared/store';
import { syncWebViewQuery } from '@shared/lib/sync-webview-query';

function CompareKindergartenDetailPage() {
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const { back, getParams } = useStackNavigation();

  // ============================================
  // 유치원 상세 정보 관련 상태
  // ============================================
  const params = useParams();
  const rawId = (params as Record<string, string | string[] | undefined>)?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const { position } = useCurrentLocation();
  const { lng, lat } = position || { lng: 126.883439, lat: 37.511281 };

  const { data: kindergartenMain } = useKindergartenMainQuery({
    id: id ?? '',
    lng,
    lat,
  });

  // ============================================
  // 비교 선택 기능 관련 상태
  // ============================================
  const selectedIds = useCompareStore((state) => state.selectedIds);
  const toggle = useCompareStore((state) => state.toggle);

  useEffect(() => {
    const navParams = getParams<{ selectedIds: SelectedIds }>();
    const selectedIds = navParams?.selectedIds;

    if (selectedIds && isSelectedIds(selectedIds)) {
      useCompareStore.setState({ selectedIds });
    }
  }, [getParams]);

  const selectedIdsArr = Object.values(selectedIds).filter(Boolean);
  const isSelected = selectedIdsArr.includes(id);
  const disabled = selectedIdsArr.length === 2 && !isSelected;

  const handleSelectClick = (id: string) => {
    toggle(id);
    const updatedState = useCompareStore.getState().selectedIds;

    // BroadcastChannel을 통해 다른 WebView에 동기화
    syncWebViewQuery.syncCompareStore(updatedState);
    back();
  };

  const handleCloseClick = () => {
    back();
  };

  if (!id || lng == null || lat == null || !kindergartenMain) return null;

  const { banner: images, ...restKindergartenMainData } = kindergartenMain;

  return (
    <SafeArea edges={['bottom']}>
      <Header className=''>
        <Header.LeftSection>
          <Header.BackButton />
          <Header.HomeButton />
        </Header.LeftSection>

        <Header.Title>{kindergartenMain?.title}</Header.Title>

        <Header.RightSection>
          <IconButton icon='Search' />
        </Header.RightSection>
      </Header>
      <div className='h-[calc(100dvh-206px)] overflow-y-auto' ref={scrollableDivRef}>
        <div>
          {/* 업체 메인이미지 슬라이드형 */}
          <MainBannerSwiper images={images ?? []} />
        </div>

        {/* 컨텐츠 영역 */}
        <div className='relative'>
          <div className='absolute top-[-50px]' />
          {/* 대표 컨텐츠 영역 */}
          <KindergartenMainBox {...restKindergartenMainData} />
          {/* Divider */}
          <Divider size='thick' />
          {/* 세부 컨텐츠 영역 */}
          {/* 탭 */}
          <KindergartenTabs scrollableDivRef={scrollableDivRef} showNearSection={false} />
        </div>
      </div>
      {/* 하단 고정 버튼 영역 */}
      <SelectActionButtons
        isSelected={isSelected}
        disabled={disabled}
        onClick={() => handleSelectClick(id)}
        onClose={handleCloseClick}
      />
    </SafeArea>
  );
}

export { CompareKindergartenDetailPage };
