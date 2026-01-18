import { useEffect, useRef, useState } from 'react';

import type { KindergartenListItem } from '@entities/kindergarten';

interface CalloutOverlayProps {
  items: KindergartenListItem[];
  totalCount?: number;
  onItemClick?: (item: KindergartenListItem) => void;
}

export function CalloutOverlay({ items, totalCount, onItemClick }: CalloutOverlayProps) {
  const scrollRef = useRef<HTMLUListElement>(null);
  const [showGradient, setShowGradient] = useState(false);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const checkScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const isScrollable = scrollHeight > clientHeight;
      const isNotAtBottom = scrollTop + clientHeight < scrollHeight - 1;
      setShowGradient(isScrollable && isNotAtBottom);
    };

    checkScroll();
    scrollElement.addEventListener('scroll', checkScroll);

    return () => scrollElement.removeEventListener('scroll', checkScroll);
  }, [items]);

  return (
    <aside
      className='radius-r2 border-line-700 bg-bg-0 py-x3 relative z-10 flex max-h-[158px] w-[120px] flex-col border shadow-[0px_1px_8px] shadow-black/20'
      role='complementary'
      aria-label='유치원 목록'
    >
      <div className='size-x5 bg-fill-secondary-700 border-line-100 radius-full absolute -top-2 -right-2 flex aspect-square items-center justify-center border'>
        <span className='caption2-extrabold text-white'>{totalCount}</span>
      </div>
      <ul ref={scrollRef} className='scrollbar-style flex flex-col overflow-y-auto' role='list'>
        {items.map((item) => (
          <li
            key={item.id}
            className='px-x2 gap-x0_5 py-x1 shadow-line-200 hover:bg-bg-50 active:bg-bg-100 flex cursor-pointer flex-col shadow-[inset_0_-1px_0_0] first:pt-0 last:shadow-none'
            role='button'
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onItemClick?.(item);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation();
                onItemClick?.(item);
              }
            }}
          >
            <p className='body2-bold text-text-primary min-w-0 overflow-hidden text-ellipsis whitespace-nowrap'>
              {item.title}
            </p>
            <span className='caption1-semibold text-text-tertiary'>{item.dist}</span>
          </li>
        ))}
      </ul>
      {showGradient && (
        <div
          className='pointer-events-none absolute right-0 bottom-0 left-0 h-[40px]'
          style={{
            borderRadius: '0 0 8px 8px',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, #FFF 100%)',
          }}
          aria-hidden='true'
        />
      )}
    </aside>
  );
}
