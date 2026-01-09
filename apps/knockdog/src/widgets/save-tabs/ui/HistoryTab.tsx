'use client';

import { useMemo } from 'react';
import { ComparisonHistoryCard, useComparisonHistoryQuery } from '@features/compare';
import type { ComparisonHistoryItem } from '@entities/compare';
import { EmptyResultSection } from './EmptyResultSection';

/**
 * 배열 형식의 날짜를 YYYY.MM.DD 형식으로 변환
 * @param dateArray [year, month, day, hour, minute, second, nanoseconds]
 * @returns YYYY.MM.DD 형식 (예: "2025.12.17")
 */
function formatDate(dateArray: number[]): string {
  const [year, month, day] = dateArray;
  return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`;
}

function groupByDate(items: ComparisonHistoryItem[]): Map<string, ComparisonHistoryItem[]> {
  const grouped = new Map<string, ComparisonHistoryItem[]>();

  for (const item of items) {
    const dateKey = formatDate(item.comparedAt);
    const existing = grouped.get(dateKey) || [];
    grouped.set(dateKey, [...existing, item]);
  }

  return grouped;
}

function HistoryTab({ searchQuery = '' }: { searchQuery?: string }) {
  const { data: historyItems = [], isLoading, error } = useComparisonHistoryQuery();

  const filteredHistoryItems = useMemo(() => {
    if (!searchQuery.trim()) return historyItems;

    const query = searchQuery.trim().toLowerCase();
    return historyItems.filter((item) => {
      // kindergartens 배열에서 left와 right의 name을 모두 확인
      if (item.kindergartens.length !== 2) return false;
      const [left, right] = item.kindergartens;
      if (!left || !right) return false;
      return left.name.toLowerCase().includes(query) || right.name.toLowerCase().includes(query);
    });
  }, [historyItems, searchQuery]);

  const groupedByDate = useMemo(() => {
    return groupByDate(filteredHistoryItems);
  }, [filteredHistoryItems]);

  const sortedDates = useMemo(() => {
    // 날짜 문자열을 Date 객체로 변환하여 내림차순 정렬 (최신 날짜가 위에)
    return Array.from(groupedByDate.keys()).sort((a, b) => {
      const dateA = new Date(a.replace(/\./g, '-'));
      const dateB = new Date(b.replace(/\./g, '-'));
      return dateB.getTime() - dateA.getTime();
    });
  }, [groupedByDate]);

  if (isLoading) {
    return (
      <div className='bg-fill-secondary-50 flex h-full min-h-0 flex-col items-center justify-center'>
        <div className='body1-regular text-text-tertiary'>로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-fill-secondary-50 flex h-full min-h-0 flex-col items-center justify-center'>
        <div className='body1-regular text-text-tertiary'>데이터를 불러오는 중 오류가 발생했습니다.</div>
      </div>
    );
  }

  if (filteredHistoryItems.length === 0) {
    // 검색어가 있고 필터링 결과가 없을 때
    if (searchQuery.trim() && historyItems.length > 0) {
      return (
        <div className='bg-fill-secondary-50 flex h-full min-h-0 flex-col'>
          <EmptyResultSection searchQuery={searchQuery} />
        </div>
      );
    }
    // 검색어가 없고 비교 내역이 없을 때
    return (
      <div className='bg-fill-secondary-50 flex h-full min-h-0 flex-col items-center justify-center'>
        <div className='body1-regular text-text-tertiary'>비교 내역이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className='bg-fill-secondary-50 flex h-full min-h-0 flex-col'>
      <div className='min-h-0 flex-1 overflow-y-auto'>
        <div className='mt-1 flex flex-col'>
          {sortedDates.map((dateKey) => {
            const items = groupedByDate.get(dateKey) || [];
            return (
              <div key={dateKey} className='mt-6 flex flex-col'>
                <div className='h3-extrabold mb-4 px-4'>{dateKey}</div>
                <div className='flex flex-col px-4'>
                  {items.map((item) => {
                    // kindergartens 배열이 정확히 2개인 경우에만 렌더링
                    if (item.kindergartens.length !== 2) {
                      return null;
                    }
                    const [first, second] = item.kindergartens;
                    if (!first || !second) {
                      return null;
                    }
                    return (
                      <ComparisonHistoryCard
                        key={item.id}
                        id={item.id}
                        kindergartens={[first, second]}
                        className='mb-4'
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { HistoryTab };
