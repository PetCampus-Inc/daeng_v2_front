'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent, Divider } from '@knockdog/ui';
import { useEffect, useCallback, useState, useRef } from 'react';

import { MemoSection } from './MemoSection';
import { ReviewSection } from './ReviewSection';
import { PricingSection } from './PricingSection';
import { BasicSection } from './BasicSection';
import { KindergartenNearSection } from './KindergartenNearSection';
import { useUserStore } from '@entities/user';
import { navigateToLogin } from '@shared/lib/bridge';
import { useTabScrollAlignment } from '../model/useTabScrollAlignment';

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

  const { tabsRef, spacerRef, scrollToTabs } = useTabScrollAlignment(
    scrollableDivRef,
    activeTab,
  );

  const handleTabChange = async (value: string) => {
    if (value === '메모' && !isLoggedIn) {
      await navigateToLogin();
      return;
    }
    setActiveTab(value);
  };

  // 로그인하지 않은 상태에서 메모 탭이 활성화되어 있으면 기본정보 탭으로 변경
  // lastAutoResetRef: 동일 탭에 대한 무한 리셋 루프 방지 가드
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
    <>
      <Tabs value={activeTab} onValueChange={handleTabChange} ref={tabsRef}>
        <TabsList scrollable className='sticky top-0 z-101 bg-white'>
          <TabsTrigger value='기본정보'>기본정보</TabsTrigger>
          <TabsTrigger value='요금'>요금</TabsTrigger>
          <TabsTrigger value='후기'>후기</TabsTrigger>
          <TabsTrigger value='메모'>메모</TabsTrigger>
        </TabsList>
        <TabsContent value='기본정보'>
          <BasicSection kindergartenId={kindergartenId} />
          {showNearSection && (
            <>
              <Divider size='thick' className='mb-12' />
              <KindergartenNearSection kindergartenId={kindergartenId} />
            </>
          )}
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
      {/* 동적 여백: 스크롤 가능 범위가 부족할 때 필요한 최소 여백만 추가 */}
      <div ref={spacerRef} />
    </>
  );
}

export { KindergartenTabs };
