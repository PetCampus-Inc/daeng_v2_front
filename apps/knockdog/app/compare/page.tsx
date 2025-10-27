'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../(main)/layout';
import { Header } from '@widgets/Header';
type SortAnchor = 'home' | 'work' | 'here';

type DistanceBy = {
  homeKm: number;
  workKm: number;
  hereKm: number;
};

interface Center {
  id: string; // ← compare-complete API가 string id 이므로 string 사용
  name: string;
  type: string;
  location: string;
  price: string;
  reviewCount: number;
  image?: string;
  selected: boolean;
  selectedAt?: number;
  distanceBy: DistanceBy;
}

const mockData: Center[] = [
  {
    id: '13561634',
    name: '바우라움 유치원',
    type: '유치원 · 호텔',
    location: '서울 강남구',
    price: '30,000부터 ~',
    reviewCount: 128,
    selected: true,
    selectedAt: Date.now() - 2,
    distanceBy: { homeKm: 10.9, workKm: 7.2, hereKm: 5.4 },
  },
  {
    id: '18662526',
    name: '다독강아지 유치원',
    type: '유치원 · 호텔',
    location: '서울 강남구',
    price: '30,000부터 ~',
    reviewCount: 128,
    selected: false,
    distanceBy: { homeKm: 12.3, workKm: 6.8, hereKm: 4.1 },
  },
  {
    id: '3',
    name: '강아지 유치원',
    type: '유치원 · 호텔',
    location: '서울 강남구',
    price: '30,000부터 ~',
    reviewCount: 128,
    selected: false,
    distanceBy: { homeKm: 9.1, workKm: 11.0, hereKm: 8.7 },
  },
];

export default function ComparePage() {
  const router = useRouter();
  const [centers, setCenters] = useState<Center[]>(mockData);
  const [anchor, setAnchor] = useState<SortAnchor>('home');

  const selected = useMemo(
    () => centers.filter((c) => c.selected).sort((a, b) => (a.selectedAt ?? 0) - (b.selectedAt ?? 0)),
    [centers]
  );
  const selectedCount = selected.length;
  const canCompare = selectedCount === 2;

  const sorted = useMemo(() => {
    const key: keyof DistanceBy = anchor === 'home' ? 'homeKm' : anchor === 'work' ? 'workKm' : 'hereKm';
    return [...centers].sort((a, b) => a.distanceBy[key] - b.distanceBy[key]);
  }, [centers, anchor]);

  const formatKm = (km: number) => `${km.toFixed(1)}km`;
  const anchorLabel = (label: SortAnchor) => (label === 'home' ? '집' : label === 'work' ? '직장' : '현위치');

  // 안전한 선택 토글 (최대 2개 유지)
  const toggle = (id: string) =>
    setCenters((prev) => {
      const next = prev.map((x) => ({ ...x }));
      const targetIndex = next.findIndex((x) => x.id === id);
      if (targetIndex === -1) return prev;
      const target = next.at(targetIndex);
      if (!target) return prev;

      if (target.selected) {
        next[targetIndex] = { ...target, selected: false, selectedAt: undefined };
        return next;
      }

      const picked = next.filter((x) => x.selected);
      if (picked.length >= 2) {
        let oldest: Center | null = null;
        for (const item of picked) {
          if (oldest === null) oldest = item;
          else if ((item.selectedAt ?? Infinity) < (oldest.selectedAt ?? Infinity)) oldest = item;
        }
        if (oldest) {
          const rmIdx = next.findIndex((x) => x.id === oldest.id);
          const toClear = next.at(rmIdx);
          if (toClear && rmIdx >= 0) next[rmIdx] = { ...toClear, selected: false, selectedAt: undefined };
        }
      }

      next[targetIndex] = { ...target, selected: true, selectedAt: Date.now() };
      return next;
    });

  const gotoCompare = () => {
    if (!canCompare) return;
    const ids = selected.map((s) => s.id).join(',');
    router.push(`/compare-complete?ids=${encodeURIComponent(ids)}`);
  };

  return (
    <Layout>
      <Suspense fallback={<div>로딩중...</div>}>
        <div className='flex h-screen flex-col bg-white'>
          {/* Header */}
          <Header>
            <Header.LeftSection>
              <Header.BackButton />
            </Header.LeftSection>
            <Header.Title>보관함</Header.Title>
          </Header>

          {/* Filter Bar */}
          <div className='flex items-center justify-between border-y border-[#EBEBF0] bg-white px-3 py-2 text-sm text-gray-700'>
            <label className='flex items-center gap-2'>
              <span className='inline-block h-2.5 w-2.5 rounded-full bg-orange-500' />
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
                  <path d='M6 9l6 6 6-6' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
                </svg>
              </div>
            </label>
          </div>

          {/* List */}
          <div className='flex-1 overflow-y-auto'>
            {sorted.map((c) => {
              const km =
                anchor === 'home' ? c.distanceBy.homeKm : anchor === 'work' ? c.distanceBy.workKm : c.distanceBy.hereKm;
              return (
                <CompareItem
                  key={c.id}
                  center={c}
                  distanceText={formatKm(km)}
                  anchorLabelText={anchorLabel(anchor)}
                  onToggle={() => toggle(c.id)}
                />
              );
            })}
          </div>

          {/* Bottom Compare Bar */}
          <div className='sticky bottom-20 border-t border-[#F3F3F7] bg-white px-4 pb-[env(safe-area-inset-bottom)] pt-3'>
            <div className='relative mb-3 grid grid-cols-2 items-start'>
              <div className='min-w-0'>
                <div className='truncate text-sm font-semibold'>{selected[0]?.name ?? '유치원 선택'}</div>
                <div className='truncate text-xs text-gray-500'>{selected[0]?.type ?? '유치원 · 호텔'}</div>
              </div>
              <div className='min-w-0 text-right'>
                <div className='truncate text-sm font-semibold'>{selected[1]?.name ?? '유치원 선택'}</div>
                <div className='truncate text-xs text-gray-500'>{selected[1]?.type ?? '유치원 · 호텔'}</div>
              </div>

              <div className='pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center'>
                <span className='font-extrabold text-orange-500'>VS</span>
                <span className='mt-1 h-6 w-px bg-gray-300' />
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <button
                type='button'
                className='h-12 w-[92px] shrink-0 rounded-2xl border border-gray-300 bg-white text-sm font-medium text-gray-700'
                onClick={() =>
                  setCenters((prev) => prev.map((x) => ({ ...x, selected: false, selectedAt: undefined })))
                }
              >
                종료
              </button>

              <button
                type='button'
                disabled={!canCompare}
                onClick={gotoCompare}
                className={`h-12 flex-1 rounded-2xl text-sm font-semibold transition-colors ${
                  canCompare ? 'bg-[#FF7A00] text-white' : 'cursor-not-allowed bg-gray-100 text-gray-400'
                } `}
              >
                비교하기 {selectedCount}/2
              </button>
            </div>
          </div>
        </div>
      </Suspense>
    </Layout>
  );
}

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
      <input type='checkbox' checked={center.selected} onChange={onToggle} className='mt-2 accent-yellow-400' />

      <div className='grid flex-1 grid-cols-[80px_1fr] gap-3'>
        <div className='h-20 w-20 rounded-lg bg-pink-200' />

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
