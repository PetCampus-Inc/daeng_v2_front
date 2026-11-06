'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@knockdog/ui/lib';

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (node) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.RefObject<T | null>).current = node;
    });
  };
}

interface TabIndicatorRect {
  left: number;
  width: number;
}

/** 현재 활성 TabsTrigger의 위치/너비를 측정해 슬라이딩 인디케이터 좌표로 반환한다. */
function useActiveTabIndicator() {
  const listRef = React.useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = React.useState<TabIndicatorRect | null>(null);

  const updateIndicator = React.useCallback(() => {
    const list = listRef.current;
    if (!list) return;

    const activeTrigger = list.querySelector<HTMLElement>('[data-slot="tabs-trigger"][data-state="active"]');
    if (!activeTrigger) return;

    const left = activeTrigger.offsetLeft;
    const width = activeTrigger.offsetWidth;

    setIndicator((prev) => (prev && prev.left === left && prev.width === width ? prev : { left, width }));
  }, []);

  React.useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  React.useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const mutationObserver = new MutationObserver(updateIndicator);
    mutationObserver.observe(list, { attributes: true, attributeFilter: ['data-state'], subtree: true });

    const resizeObserver = new ResizeObserver(updateIndicator);
    resizeObserver.observe(list);

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [updateIndicator]);

  return { listRef, indicator };
}

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root data-slot='tabs' className={cn(className)} {...props} />
  );
}

function TabsList({
  className,
  scrollable = false,
  children,
  ref: forwardedRef,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  scrollable?: boolean;
}) {
  const { listRef, indicator } = useActiveTabIndicator();
  const mergedRef = React.useMemo(
    () => mergeRefs(listRef, forwardedRef),
    [listRef, forwardedRef]
  );

  return (
    <TabsPrimitive.List
      ref={mergedRef}
      data-slot='tabs-list'
      className={cn(
        'border-b-1 border-line-200 relative flex px-4',
        scrollable && [
          'overflow-x-auto',
          '[&::-webkit-scrollbar]:hidden',
          '[-ms-overflow-style:none]',
          '[scrollbar-width:none]',
        ],
        className
      )}
      {...props}
    >
      {children}
      {indicator && (
        <span
          aria-hidden
          className='bg-line-accent pointer-events-none absolute bottom-0 left-0 h-[3px] transition-[transform,width] duration-200 ease-out motion-reduce:transition-none'
          style={{ width: indicator.width, transform: `translateX(${indicator.left}px)` }}
        />
      )}
    </TabsPrimitive.List>
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot='tabs-trigger'
      className={cn(
        'data-[state=active]:text-text-accent body2-semibold border-b-3 flex-1 whitespace-nowrap border-b-transparent p-4 pb-3 transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot='tabs-content'
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
