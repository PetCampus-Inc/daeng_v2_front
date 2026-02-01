'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent, Divider } from '@knockdog/ui';
import { useRef, useEffect, useCallback, useState } from 'react';

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
  value?: string;
  onValueChange?: (value: string) => void;
}

function KindergartenTabs({
  kindergartenId,
  scrollableDivRef,
  showNearSection = true,
  value,
  onValueChange,
}: KindergartenTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState('기본정보');
  const isControlled = value !== undefined;
  const activeTab = isControlled ? value : uncontrolledValue;
  const isLoggedIn = useUserStore((state) => !!state.user);
  const lastAutoResetRef = useRef<string | null>(null);

  const setActiveTab = useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange]
  );

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

    // 탭 변경 시점에 즉시 스크롤 (데이터 로딩 전에도 실행)
    requestAnimationFrame(() => scrollToTabs());
  };

  // 로그인하지 않은 상태에서 메모 탭이 활성화되어 있으면 기본정보 탭으로 변경
  useEffect(() => {
    if (activeTab === '메모' && !isLoggedIn) {
      if (lastAutoResetRef.current !== '메모') {
        lastAutoResetRef.current = '메모';
        setActiveTab('기본정보');
      }
      return;
    }
    lastAutoResetRef.current = null;
  }, [activeTab, isLoggedIn, setActiveTab]);

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} ref={tabsRef}>
      <TabsList scrollable className='sticky top-0 z-101 bg-white'>
        <TabsTrigger value='기본정보'>기본정보</TabsTrigger>
        <TabsTrigger value='요금'>요금</TabsTrigger>
        <TabsTrigger value='후기'>후기</TabsTrigger>
        <TabsTrigger value='메모'>메모</TabsTrigger>
      </TabsList>
      <TabsContent value='기본정보' className='min-h-screen'>
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
      <TabsContent value='요금' className='min-h-screen'>
        <PricingSection kindergartenId={kindergartenId} />
      </TabsContent>
      <TabsContent value='후기' className='min-h-screen'>
        <ReviewSection kindergartenId={kindergartenId} onScrollTop={scrollToTabs} />
      </TabsContent>
      <TabsContent value='메모' className='min-h-screen'>
        <MemoSection kindergartenId={kindergartenId} />
      </TabsContent>
    </Tabs>
  );
}

export { KindergartenTabs };
