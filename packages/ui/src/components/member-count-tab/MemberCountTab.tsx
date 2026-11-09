'use client';

import { useState, type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

interface MemberCountTabItem {
  id: string;
  label: ReactNode;
  count?: ReactNode;
}

interface MemberCountTabProps {
  items?: MemberCountTabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

const DEFAULT_ITEMS: MemberCountTabItem[] = [
  { id: 'first', label: 'Title', count: 5 },
  { id: 'second', label: 'Title', count: 5 },
];

/** V4 / Selection / Member Tab */
function MemberCountTab({
  items = DEFAULT_ITEMS,
  value,
  defaultValue,
  onValueChange,
  className,
}: MemberCountTabProps) {
  const [innerValue, setInnerValue] = useState(defaultValue ?? items[0]?.id);
  const selected = value ?? innerValue;

  function selectTab(id: string) {
    setInnerValue(id);
    onValueChange?.(id);
  }

  return (
    <div role='tablist' className={cn('border-line-200 flex w-full border-b border-solid', className)}>
      {items.map((item) => {
        const isSelected = item.id === selected;

        return (
          <button
            key={item.id}
            type='button'
            role='tab'
            data-testid={`member-count-tab-${item.id}`}
            aria-selected={isSelected}
            onClick={() => selectTab(item.id)}
            className={cn(
              'body1-bold flex flex-1 items-center justify-center gap-x2 px-x4 py-x3',
              isSelected ? 'text-text-accent border-line-accent -mb-px border-b-[3px] border-solid' : 'text-text-secondary'
            )}
          >
            {item.label}
            {/* 화면 낭독기가 `신청 5`처럼 띄어 읽도록 공백을 둔다 (flex라 화면에는 보이지 않음) */}
            {item.count != null ? ' ' : null}
            {item.count != null ? (
              <span className='caption1-semibold text-text-accent bg-primitive-orange-100 radius-r2 inline-flex h-[22px] min-w-[26px] items-center justify-center px-x2 py-x1'>
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export { MemberCountTab };
export type { MemberCountTabItem, MemberCountTabProps };
