'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../(main)/layout';
import { IconButton } from '@knockdog/ui';
import { Header } from '@widgets/Header';
import { useBookmarksQuery, CompareListItem } from '@features/bookmarked-list';
import type { CTag, ReferencePointType } from '@entities/compare';
import { serializeCategories } from '@entities/compare';
import type { DistanceInfo } from '@entities/bookmark';
import { SafeArea } from '@shared/ui/safe-area';

// Helper: refPoint에 맞는 거리 정보 찾기
function findDistanceByRefPoint(distances: DistanceInfo[], refPoint: ReferencePointType): DistanceInfo | undefined {
  return distances.find((d) => d.referencePoint === refPoint);
}

// Helper: 거리를 숫자(km)로 파싱
function parseDistanceToKm(distance: string): number {
  const match = distance.match(/[\d.]+/);
  if (!match) {
    return Infinity;
  }
  return Number.parseFloat(match[0]);
}

/* =========================
 * 페이지
 * ========================= */
export default function ComparePage() {
  const router = useRouter();
  const [refPoint, setRefPoint] = useState<ReferencePointType>('HOME');

  const { data: bookmarks = [], isLoading, error } = useBookmarksQuery();

  const [selectedIds, setSelectedIds] = useState<{
    left: string | null;
    right: string | null;
  }>({ left: null, right: null });

  const selectedKindergartens = useMemo(() => {
    const left = bookmarks?.find((c) => c.id === selectedIds.left);
    const right = bookmarks?.find((c) => c.id === selectedIds.right);
    return { left, right };
  }, [bookmarks, selectedIds]);

  const selectedCount = Object.values(selectedKindergartens).filter(Boolean).length;
  const canCompare = selectedCount === 2;

  const sortedBookmarks = useMemo(() => {
    return [...bookmarks].sort((a, b) => {
      const distA = findDistanceByRefPoint(a.distances, refPoint);
      const distB = findDistanceByRefPoint(b.distances, refPoint);
      const kmA = distA ? parseDistanceToKm(distA.distance) : Infinity;
      const kmB = distB ? parseDistanceToKm(distB.distance) : Infinity;
      return kmA - kmB;
    });
  }, [bookmarks, refPoint]);

  /* =========================
   * DEV 로그인 (토큰 갱신 → localStorage 저장)
   * ========================= */
  const handleDevLogin = async () => {
    try {
      const res = await fetch('/api/v0/auth/dev/1', {
        method: 'GET',
        headers: { accept: 'application/json;charset=UTF-8' },
        cache: 'no-store',
        credentials: 'include',
      });

      if (!res.ok) throw new Error(`로그인 실패: ${res.status}`);
      const authHeader = res.headers.get('authorization') || res.headers.get('Authorization');
      if (!authHeader) throw new Error('Authorization 헤더 없음');

      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      localStorage.setItem('accessToken', token);

      alert('✅ DEV 로그인 성공! 토큰이 저장되었습니다.');
      // 필요하면 새로고침
      // window.location.reload();
    } catch (err) {
      console.error('DEV 로그인 중 오류:', err);
      alert('❌ 로그인 실패. 콘솔을 확인하세요.');
    }
  };

  /* =========================
   * 비교 → compare-complete로 이동 (여기선 API 호출 안 함)
   * ========================= */
  const gotoCompare = () => {
    if (!canCompare) return;
    const ids = Object.values(selectedKindergartens)
      .map((kg) => kg!.id)
      .join(',');
    // 스펙: GET + ids 파라미터 → compare-complete에서 실제 API 호출
    router.push(`/compare-complete?ids=${encodeURIComponent(ids)}`);
  };

  /* =========================
   * 유치원 선택 토글 (최대 2개 유지)
   * ========================= */
  const toggleCheckbox = (id: string) => {
    setSelectedIds((prev) => {
      // 1. 이미 선택된 유치원일 경우: 해당 슬롯을 비움
      if (prev.left === id) {
        return { ...prev, left: null };
      }
      if (prev.right === id) {
        return { ...prev, right: null };
      }

      // 2. 새로 선택된 유치원일 경우
      // 2-1. 양쪽이 모두 차있으면 추가 불가
      if (prev.left !== null && prev.right !== null) {
        return { ...prev };
      }

      // 2-2. 빈 슬롯에 추가
      if (prev.left === null) {
        return { ...prev, left: id };
      }
      return { ...prev, right: id };
    });
  };

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <p className='p-6 text-sm text-gray-500'>비교 데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <p className='p-6 text-sm text-gray-500'>데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <Layout>
      <SafeArea edges={['top']} className='flex h-dvh flex-col'>
        <Suspense fallback={<div>로딩중...</div>}>
          <div className='flex h-screen flex-col bg-white'>
            {/* Header */}
            <Header>
              <Header.LeftSection>
                <Header.BackButton />
              </Header.LeftSection>
              <Header.Title>보관함</Header.Title>
              <Header.RightSection>
                <IconButton icon='Search' />
              </Header.RightSection>
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
                    value={refPoint}
                    onChange={(e) => setRefPoint(e.target.value as ReferencePointType)}
                    className='appearance-none rounded-md border border-[#EBEBF0] bg-white px-3 py-1.5 pr-8 text-sm text-gray-800'
                    aria-label='거리 기준 선택'
                  >
                    <option value='HOME'>집</option>
                    <option value='WORK'>직장</option>
                    <option value='OTHER'>기타</option>
                  </select>
                  <svg
                    className='pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-gray-500'
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
              {sortedBookmarks.map((kindergarten) => {
                const distInfo = findDistanceByRefPoint(kindergarten.distances, refPoint);
                const distanceText = distInfo?.distance || '- km';
                return (
                  <CompareListItem
                    key={kindergarten.id}
                    kindergarten={kindergarten}
                    distanceText={distanceText}
                    isSelected={selectedIds.left === kindergarten.id || selectedIds.right === kindergarten.id}
                    onToggle={() => toggleCheckbox(kindergarten.id)}
                  />
                );
              })}
            </div>

            {/* Bottom Compare Bar */}
            <div className='sticky bottom-20 border-t border-[#F3F3F7] bg-white px-4 pt-3 pb-[env(safe-area-inset-bottom)]'>
              <div className='relative mb-3 grid grid-cols-2 items-start'>
                <div className='min-w-0'>
                  <div className='truncate text-sm font-semibold'>
                    {selectedKindergartens?.left?.name ?? '유치원 선택'}
                  </div>
                  <div className='truncate text-xs text-gray-500'>
                    {serializeCategories(selectedKindergartens?.left?.categories as CTag[])}
                  </div>
                </div>
                <div className='min-w-0 text-right'>
                  <div className='truncate text-sm font-semibold'>
                    {selectedKindergartens?.right?.name ?? '유치원 선택'}
                  </div>
                  <div className='truncate text-xs text-gray-500'>
                    {serializeCategories(selectedKindergartens?.right?.categories as CTag[])}
                  </div>
                </div>

                <div className='pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center'>
                  <span className='font-extrabold text-orange-500'>VS</span>
                  <span className='mt-1 h-6 w-px bg-gray-300' />
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <button
                  type='button'
                  className='h-12 w-[92px] shrink-0 rounded-2xl border border-gray-300 bg-white text-sm font-medium text-gray-700'
                  onClick={() => setSelectedIds({ left: null, right: null })}
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
                  {`비교하기 ${selectedCount}/2`}
                </button>
              </div>
            </div>

            {/* ✅ 왼쪽 하단 Dev 로그인 버튼 */}
            <button
              onClick={handleDevLogin}
              className='fixed bottom-20 left-4 flex items-center gap-2 rounded-full bg-[#333] px-4 py-3 text-xs font-semibold text-white shadow-lg'
            >
              🔑 DEV 로그인
            </button>
          </div>
        </Suspense>
      </SafeArea>
    </Layout>
  );
}
