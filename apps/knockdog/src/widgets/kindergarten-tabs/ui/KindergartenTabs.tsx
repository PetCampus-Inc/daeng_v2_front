'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent, Divider } from '@knockdog/ui';
import { useRef, useEffect, useCallback } from 'react';
import { useKindergartenTab } from '../model';

import { MemoSection } from './MemoSection';
import { ReviewSection } from './ReviewSection';
import { PricingSection } from './PricingSection';
import { BasicSection } from './BasicSection';
import { KindergartenNearSection } from './KindergartenNearSection';
import { useUserStore } from '@entities/user';
import { navigateToLogin } from '@shared/lib/bridge';

interface KindergartenTabsProps {
  kindergartenId?: string;
  scrollableDivRef?: React.RefObject<HTMLDivElement | null>;
  showNearSection?: boolean;
}

function KindergartenTabs({ kindergartenId, scrollableDivRef, showNearSection = true }: KindergartenTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const [activeTab, setActiveTab] = useKindergartenTab();
  const isLoggedIn = useUserStore((state) => !!state.user);

  const scrollToTabs = useCallback(() => {
    const scrollContainer = scrollableDivRef?.current;
    const tabsElement = tabsRef.current;

    if (!scrollContainer || !tabsElement) return;

    requestAnimationFrame(() => {
      const tabsRect = tabsElement.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();
      const scrollTop = scrollContainer.scrollTop;

      // 스크롤 컨테이너 내부에서 탭의 절대 위치
      const tabOffsetInContainer = tabsRect.top - containerRect.top + scrollTop;

      scrollContainer.scrollTo({
        top: tabOffsetInContainer,
        behavior: 'smooth',
      });
    });
  }, [scrollableDivRef]);

  const handleTabChange = async (value: string) => {
    if (value === '메모' && !isLoggedIn) {
      await navigateToLogin();
      return;
    }
    setActiveTab(value);
  };

  // 로그인하지 않은 상태에서 메모 탭이 활성화되어 있으면 기본정보 탭으로 변경
  useEffect(() => {
    if (activeTab === '메모' && !isLoggedIn) {
      setActiveTab('기본정보');
    }
  }, [activeTab, isLoggedIn, setActiveTab]);

  // 탭 변경 시 스크롤
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (activeTab === '기본정보') return;
    if (!scrollableDivRef?.current) return;

    scrollToTabs();
  }, [activeTab, scrollableDivRef, scrollToTabs]);

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} ref={tabsRef}>
      <TabsList scrollable className='sticky top-0 z-101 bg-white'>
        <TabsTrigger value='기본정보'>기본정보</TabsTrigger>
        <TabsTrigger value='요금'>요금</TabsTrigger>
        <TabsTrigger value='후기'>후기</TabsTrigger>
        <TabsTrigger value='메모'>메모</TabsTrigger>
      </TabsList>
      <TabsContent value='기본정보'>
        <>
          <BasicSection kindergartenId={kindergartenId} />
          {showNearSection && (
            <>
              {/* Divider */}
              <Divider size='thick' className='mb-12' />

              {/* 이 근처 다른 유치원은 어때요? */}
              <KindergartenNearSection kindergartenId={kindergartenId} />
            </>
          )}
        </>
      </TabsContent>
      <TabsContent value='요금'>
        <PricingSection kindergartenId={kindergartenId} />
      </TabsContent>
      <TabsContent value='후기'>
        <ReviewSection kindergartenId={kindergartenId} onScrollTop={scrollToTabs} />
      </TabsContent>
      <TabsContent value='메모'>
        <MemoSection kindergartenId={kindergartenId} />
      </TabsContent>
    </Tabs>
  );
}

export { KindergartenTabs };
