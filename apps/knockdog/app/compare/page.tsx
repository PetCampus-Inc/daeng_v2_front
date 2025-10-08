'use client';

import { Suspense, useMemo, useState } from 'react';

type SortAnchor = 'home' | 'work' | 'here';

type DistanceBy = {
  homeKm: number; // 집 기준 거리(km)
  workKm: number; // 직장 기준 거리(km)
  hereKm: number; // 현위치 기준 거리(km)
};

interface Center {
  id: number;
  name: string;
  type: string;
  location: string;
  price: string;
  reviewCount: number;
  image: string;
  selected: boolean;
  selectedAt?: number; // 선택 시각 (오래된 선택 우선 해제)
  distanceBy: DistanceBy;
}

const mockData: Center[] = [
  {
    id: 1,
    name: '바우라움 유치원',
    type: '유치원 · 호텔',
    location: '서울 강남구',
    price: '30,000부터 ~',
    reviewCount: 128,
    image: '/dog1.png',
    selected: true,
    selectedAt: Date.now() - 2, // 초기 선택값이면 과거 타임스탬프 하나 찍어둠
    distanceBy: { homeKm: 10.9, workKm: 7.2, hereKm: 5.4 },
  },
  {
    id: 2,
    name: '다독강아지 유치원',
    type: '유치원 · 호텔',
    location: '서울 강남구',
    price: '30,000부터 ~',
    reviewCount: 128,
    image: '/dog2.png',
    selected: false,
    distanceBy: { homeKm: 12.3, workKm: 6.8, hereKm: 4.1 },
  },
  {
    id: 3,
    name: '강아지 유치원',
    type: '유치원 · 호텔',
    location: '서울 강남구',
    price: '30,000부터 ~',
    reviewCount: 128,
    image: '/dog1.png',
    selected: false,
    distanceBy: { homeKm: 9.1, workKm: 11.0, hereKm: 8.7 },
  },
];

export default function Compare() {
  const [centers, setCenters] = useState<Center[]>(mockData);
  const [anchor, setAnchor] = useState<SortAnchor>('home'); // 거리 기준 (집/직장/현위치)

  // 선택된 2개(또는 1개)를 선택시간 오름차순으로 정렬해서 사용
  const selected = useMemo(
    () =>
      centers
        .filter((center) => center.selected)
        .sort((first, second) => (first.selectedAt ?? 0) - (second.selectedAt ?? 0)),
    [centers]
  );
  const selectedCount = selected.length;
  const canCompare = selectedCount === 2;

  // 리스트 정렬: 선택한 기준(anchor)에 맞춰 km 오름차순
  const sorted = useMemo(() => {
    const key: keyof DistanceBy = anchor === 'home' ? 'homeKm' : anchor === 'work' ? 'workKm' : 'hereKm';
    return [...centers].sort((first, second) => first.distanceBy[key] - second.distanceBy[key]);
  }, [centers, anchor]);

  // 거리 텍스트 포맷
  const formatKm = (km: number) => `${km.toFixed(1)}km`;
  const anchorLabel = (label: SortAnchor) => (label === 'home' ? '집' : label === 'work' ? '직장' : '현위치');

  // 선택 토글: 최대 2개 유지, 3번째 선택 시 가장 오래된 선택 해제 (TS 안전)
  const toggleSelect = (id: number) => {
    setCenters((prev) => {
      const next = prev.map((value) => ({ ...value })); // 얕은 복사
      // 인덱스 대신 find로 안전 접근
      const target = next.find((value) => value.id === id);
      if (!target) return prev;

      // 이미 선택된 항목 클릭 → 해제
      if (target.selected) {
        target.selected = false;
        target.selectedAt = undefined;
        return next;
      }

      // 새로 선택: 이미 2개면 가장 오래된 선택 해제
      const selectedList = next.filter((value) => value.selected);
      if (selectedList.length >= 2) {
        // reduce 대신 루프 사용 → TS가 undefined 의심 안 함
        let oldest = selectedList[0];
        for (let i = 1; i < selectedList.length; i++) {
          const cur = selectedList[i];
          if ((cur?.selectedAt ?? Infinity) < (oldest?.selectedAt ?? Infinity)) {
            oldest = cur;
          }
        }
        const toClear = next.find((value) => value.id === oldest?.id);
        if (toClear) {
          toClear.selected = false;
          toClear.selectedAt = undefined;
        }
      }

      // 현재 항목 선택
      target.selected = true;
      target.selectedAt = Date.now();
      return next;
    });
  };

  return (
    <Suspense fallback={<div>로딩중...</div>}>
      <div className='flex h-screen flex-col bg-white'>
        {/* Header */}
        <header className='relative flex items-center justify-center border-b border-[#F3F3F7] bg-white px-3 py-3'>
          <h1 className='text-[17px] font-semibold'>유치원 비교</h1>
          <button className='absolute right-3 inline-flex p-1' aria-label='검색'>
            <svg width='22' height='22' viewBox='0 0 24 24' fill='none'>
              <circle cx='11' cy='11' r='7' stroke='#111' strokeWidth='2' />
              <path d='M20 20L16.65 16.65' stroke='#111' strokeWidth='2' strokeLinecap='round' />
            </svg>
          </button>
        </header>

        {/* Filter Bar: 메모 + 거리 기준 셀렉트 */}
        <div className='flex items-center justify-between border-y border-[#EBEBF0] bg-white px-3 py-2 text-sm text-gray-700'>
          <label className='flex items-center gap-2'>
            <span className='inline-flex size-[18px] items-center justify-center rounded-sm border border-gray-300'>
              <span className='size-[10px] rounded-sm bg-[#B4B4BB]' />
            </span>
            메모
          </label>

          <label className='flex items-center gap-2'>
            <span className='text-gray-700'>거리기준:</span>
            <div className='relative'>
              <select
                value={anchor}
                onChange={(e) => setAnchor(e.target.value as SortAnchor)}
                className='appearance-none rounded-md border border-[#EBEBF0] bg-white px-3 py-1.5 pr-8 text-sm text-gray-800'
                aria-label='거리 기준 선택'
              >
                <option value='home'>집</option>
                <option value='work'>직장</option>
                <option value='here'>현위치</option>
              </select>
              <svg
                className='pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500'
                viewBox='0 0 24 24'
                fill='none'
                aria-hidden='true'
              >
                <path
                  d='M6 9l6 6 6-6'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </div>
          </label>
        </div>

        {/* List (정렬 반영) */}
        <div className='flex-1 overflow-y-auto'>
          {sorted.map((label) => {
            const km =
              anchor === 'home'
                ? label.distanceBy.homeKm
                : anchor === 'work'
                  ? label.distanceBy.workKm
                  : label.distanceBy.hereKm;
            return (
              <CompareItem
                key={label.id}
                center={label}
                distanceText={formatKm(km)}
                anchorLabelText={anchorLabel(anchor)}
                onToggle={() => toggleSelect(label.id)}
              />
            );
          })}
        </div>

        {/* Bottom Compare Bar */}
        <div className='sticky bottom-0 mb-[80px] border-t border-[#F3F3F7] bg-white px-4 py-3'>
          <div className='sticky bottom-0 border-t border-[#EBEBF0] bg-white px-4 pb-[env(safe-area-inset-bottom)] pt-3'>
            {/* 선택 요약 */}
            <div className='relative mb-3 grid grid-cols-2 items-start'>
              <div className='min-w-0'>
                <div className='truncate text-sm font-semibold'>{selected[0]?.name ?? '유치원 선택'}</div>
                <div className='truncate text-xs text-gray-500'>{selected[0]?.type ?? '유치원 · 호텔'}</div>
              </div>
              <div className='min-w-0 text-right'>
                <div className='truncate text-sm font-semibold'>{selected[1]?.name ?? '유치원 선택'}</div>
                <div className='truncate text-xs text-gray-500'>{selected[1]?.type ?? '유치원 · 호텔'}</div>
              </div>

              {/* 가운데 VS + 세로 라인 */}
              <div className='pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center'>
                <span className='font-extrabold text-orange-500'>VS</span>
                <span className='mt-1 h-6 w-px bg-gray-300' />
              </div>
            </div>

            {/* 버튼 행 */}
            <div className='flex items-center gap-3'>
              <button
                type='button'
                className='h-12 w-[92px] shrink-0 rounded-2xl border border-gray-300 bg-white text-sm font-medium text-gray-700'
              >
                종료
              </button>

              <button
                type='button'
                disabled={!canCompare}
                className={`h-12 flex-1 rounded-2xl text-sm font-semibold transition-colors ${
                  canCompare ? 'bg-[#FF7A00] text-white' : 'cursor-not-allowed bg-gray-100 text-gray-400'
                } `}
              >
                비교하기 {selectedCount}/2
              </button>
            </div>

            {/* 현재 정렬 기준 안내 */}
            <p className='mt-2 text-center text-xs text-gray-500'>
              현재 정렬: <b>{anchorLabel(anchor)}</b> 기준 가까운 순
            </p>
          </div>
        </div>
      </div>
    </Suspense>
  );
}

/** 리스트 아이템 */
function CompareItem({
  center,
  onToggle,
  distanceText,
  anchorLabelText,
}: {
  center: Center;
  onToggle: () => void;
  distanceText: string;
  anchorLabelText: string;
}) {
  return (
    <div className='flex items-start gap-3 border-b border-[#F3F3F7] bg-white px-3 py-3'>
      {/* 체크박스 */}
      <input type='checkbox' checked={center.selected} onChange={onToggle} className='mt-2 accent-yellow-400' />

      {/* 2열 그리드 */}
      <div className='grid flex-1 grid-cols-[80px_1fr] gap-3'>
        {/* 썸네일 자리 */}
        <div className='h-20 w-20 rounded-lg bg-pink-200' />

        {/* 정보 */}
        <div className='min-w-0'>
          <div className='flex items-start justify-between gap-2'>
            <h3 className='truncate text-base font-bold leading-tight'>{center.name}</h3>
            <button aria-label='북마크' className='shrink-0 rounded-md p-1 text-gray-600 hover:bg-gray-100'>
              <svg className='h-5 w-5' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M6 2a2 2 0 0 0-2 2v18l8-4 8 4V4a2 2 0 0 0-2-2H6z' />
              </svg>
            </button>
          </div>

          <div className='mt-0.5 text-sm text-gray-500'>{center.type}</div>

          {/* 리뷰/메모 칩 */}
          <div className='mt-2 flex items-center gap-2'>
            <span className='inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[11px] font-medium text-green-700'>
              <span className='font-bold'>N</span>
              <span>리뷰 {center.reviewCount}개</span>
            </span>
            <span className='inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-700'>
              <svg className='h-3.5 w-3.5' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M4 3h16v14l-6-3-6 3V3z' />
              </svg>
              <span>2025.04.16 메모</span>
            </span>
          </div>
        </div>

        {/* 하단 메타 */}
        <div className='col-span-2 mt-2 flex items-center gap-3 text-[13px] text-gray-700'>
          <span className='inline-flex items-center gap-1'>
            <svg className='h-4 w-4' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
              <path d='M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z' />
            </svg>
            <span className='font-semibold'>{distanceText}</span>
            <span className='text-gray-500'>
              {center.location} · {anchorLabelText} 기준
            </span>
          </span>

          <span className='h-3.5 w-px bg-gray-300' aria-hidden='true' />

          <span className='inline-flex items-center gap-1'>
            <span className='text-sm'>₩</span>
            <span className='font-semibold'>이용요금</span>
            <span>{center.price}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
