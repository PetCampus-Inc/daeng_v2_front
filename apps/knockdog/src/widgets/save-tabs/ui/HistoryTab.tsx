'use client';

import { useMemo } from 'react';
import { ComparisonHistoryCard, useComparisonHistoryQuery } from '@features/compare';
import type { ComparisonHistoryItem } from '@entities/compare';
import { parseArrayToDate } from '@shared/utils/date';

/**
 * 배열 형식의 날짜를 YYYY.MM.DD 형식으로 변환
 * @param dateArray [year, month, day, hour, minute, second, nanoseconds]
 * @returns YYYY.MM.DD 형식 (예: "2025.12.11")
 */
function formatDate(dateArray: number[]): string {
  const date = parseArrayToDate(dateArray);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
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

function HistoryTab() {
  const { data: historyItems = [], isLoading, error } = useComparisonHistoryQuery();

  const groupedByDate = useMemo(() => {
    return groupByDate(historyItems);
  }, [historyItems]);

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

  if (historyItems.length === 0) {
    return (
      <div className='bg-fill-secondary-50 flex h-full min-h-0 flex-col items-center justify-center'>
        <div className='body1-regular text-text-tertiary'>비교 내역이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className='bg-fill-secondary-50 flex h-full min-h-0 flex-col'>
      <div className='min-h-0 flex-1 overflow-y-auto'>
        <div className='flex flex-col py-7'>
          {sortedDates.map((dateKey) => {
            const items = groupedByDate.get(dateKey) || [];
            return (
              <div key={dateKey}>
                <div className='h3-extrabold px-4 pb-4'>{dateKey}</div>
                <div className='flex flex-col gap-4 px-2'>
                  {items.map((item) => {
                    // kindergartens 배열이 정확히 2개인 경우에만 렌더링
                    if (item.kindergartens.length !== 2) {
                      return null;
                    }
                    const [first, second] = item.kindergartens;
                    if (!first || !second) {
                      return null;
                    }
                    return <ComparisonHistoryCard key={item.id} id={item.id} kindergartens={[first, second]} />;
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
