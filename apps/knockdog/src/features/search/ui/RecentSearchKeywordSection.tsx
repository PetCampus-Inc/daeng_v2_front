'use client';

import { Icon } from '@knockdog/ui';

interface RecentSearchKeywordSectionProps {
  keywords: string[];
  onSelect: (keyword: string) => void;
  onRemove: (index: number) => void;
  onClearAll: () => void;
  title?: string;
  clearAllLabel?: string;
  /** 상단 여백 — 내 주변 검색은 34px, 소식 검색은 단독 섹션이라 더 작게 */
  className?: string;
}

/**
 * 최근 검색어 리스트 (내 주변 검색과 동일 UI)
 */
function RecentSearchKeywordSection({
  keywords,
  onSelect,
  onRemove,
  onClearAll,
  title = '최근 검색어',
  clearAllLabel = '전체 삭제',
  className = 'mt-[34px]',
}: RecentSearchKeywordSectionProps) {
  if (keywords.length === 0) return null;

  return (
    <section className={`gap-x4 flex flex-col px-4 ${className}`}>
      <div className='bg-fill-secondary-0 sticky top-0 z-10 -mx-4 flex items-center justify-between px-4'>
        <h3 className='body1-extrabold text-text-primary'>{title}</h3>
        <button
          type='button'
          onClick={onClearAll}
          className='caption1-semibold text-text-tertiary px-x2 py-x1'
        >
          {clearAllLabel}
        </button>
      </div>
      <ul className='gap-x1 flex flex-col'>
        {keywords.map((keyword, index) => (
          <li
            key={`${keyword}-${index}`}
            className='py-x2.5 hover:bg-fill-secondary-50 radius-r2 flex w-full items-center justify-between'
          >
            <button
              type='button'
              className='body2-regular text-text-primary gap-x-x1 px-x2 py-x1 inline-flex min-w-0 flex-1 cursor-pointer items-center text-left'
              onClick={() => onSelect(keyword)}
            >
              <Icon icon='Time' className='text-fill-secondary-400 size-x5 shrink-0' />
              <span className='truncate'>{keyword}</span>
            </button>
            <button
              type='button'
              aria-label={`${keyword} 삭제`}
              className='mr-x2 flex shrink-0 cursor-pointer items-center justify-center'
              onClick={() => onRemove(index)}
            >
              <Icon icon='Close' className='size-x5 text-fill-secondary-700' />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export { RecentSearchKeywordSection };
export type { RecentSearchKeywordSectionProps };
