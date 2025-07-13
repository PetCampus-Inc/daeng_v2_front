'use client';

import dynamic from 'next/dynamic';

import { NaverMap } from '@shared/ui/naver-map';

const BottomSheet = dynamic(() => import('./ui/MapBottomSheet'), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <NaverMap />
      {/* 지도 배경 오버레이 */}
      <div className='z-2 bg-primitive-neutral-50/12 pointer-events-none absolute top-0 h-full w-full touch-none' />
      <BottomSheet />
    </>
  );
}
