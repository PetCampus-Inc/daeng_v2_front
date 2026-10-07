import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { FilterChip } from './FilterChip';
import { FILTER_CONFIG, FILTER_OPTIONS, type FilterCategory, type FilterOption } from '@entities/kindergarten';

const programmaticScrollTimeouts = new WeakMap<HTMLElement, number>();

export function scrollFilterListToCategory(
  root: HTMLElement | null,
  category: FilterCategory,
  behavior: ScrollBehavior = 'smooth'
) {
  const target = root?.querySelector<HTMLElement>(`[data-filter-category="${category}"]`);
  if (!root || !target) return;

  const rootTop = root.getBoundingClientRect().top;
  const targetTop = target.getBoundingClientRect().top;
  if (behavior === 'smooth') {
    root.dataset.programmaticScroll = 'true';
    const previousTimeout = programmaticScrollTimeouts.get(root);
    if (previousTimeout) window.clearTimeout(previousTimeout);
    programmaticScrollTimeouts.set(
      root,
      window.setTimeout(() => {
        delete root.dataset.programmaticScroll;
        programmaticScrollTimeouts.delete(root);
      }, 1000)
    );
  }
  root.scrollTo({ top: root.scrollTop + targetTop - rootTop - 16, behavior });
}

interface FilterContentProps {
  isSelected: (option: FilterOption) => boolean;
  onToggleOption: (option: FilterOption) => void;
  listRef: RefObject<HTMLDivElement | null>;
  initialCategory?: FilterCategory;
  onActiveCategoryChange: (category: FilterCategory) => void;
}

export function FilterList({
  isSelected,
  onToggleOption,
  listRef,
  initialCategory,
  onActiveCategoryChange,
}: FilterContentProps) {
  const [bottomSpacerHeight, setBottomSpacerHeight] = useState(0);
  const scrollSettleTimerRef = useRef<number | null>(null);

  const scrollToCategory = useCallback(
    (category: FilterCategory, behavior: ScrollBehavior = 'smooth') => {
      scrollFilterListToCategory(listRef.current, category, behavior);
    },
    [listRef]
  );

  useLayoutEffect(() => {
    const root = listRef.current;
    if (!root) return;

    const updateBottomSpacer = () => {
      const sections = root.querySelectorAll<HTMLElement>('[data-filter-category]');
      const lastSection = sections.item(sections.length - 1);
      if (!lastSection) return;
      // Leave enough scroll range to place even the final section below the tabs.
      setBottomSpacerHeight(Math.max(0, root.clientHeight - lastSection.offsetHeight - 16));
    };

    updateBottomSpacer();
    const observer = new ResizeObserver(updateBottomSpacer);
    observer.observe(root);
    const sections = root.querySelectorAll<HTMLElement>('[data-filter-category]');
    const lastSection = sections.item(sections.length - 1);
    if (lastSection) observer.observe(lastSection);
    return () => observer.disconnect();
  }, [listRef]);

  useEffect(() => {
    if (!initialCategory) return;
    const frameId = window.requestAnimationFrame(() => scrollToCategory(initialCategory, 'auto'));
    return () => window.cancelAnimationFrame(frameId);
  }, [initialCategory, scrollToCategory]);

  useEffect(() => {
    const root = listRef.current;
    if (!root) return;

    const updateActiveCategory = () => {
      if (root.dataset.programmaticScroll === 'true') return;
      const rootTop = root.getBoundingClientRect().top;
      const sections = Array.from(root.querySelectorAll<HTMLElement>('[data-filter-category]'));
      const isAtListEnd = root.scrollTop + root.clientHeight >= root.scrollHeight - 1;
      if (isAtListEnd) {
        const lastCategory = sections.at(-1)?.dataset.filterCategory as FilterCategory | undefined;
        if (lastCategory) onActiveCategoryChange(lastCategory);
        return;
      }

      const visibleSection = sections.find((section) => section.getBoundingClientRect().bottom > rootTop + 32);
      const category = visibleSection?.dataset.filterCategory as FilterCategory | undefined;
      if (category) onActiveCategoryChange(category);
    };

    const finishProgrammaticScroll = () => {
      if (scrollSettleTimerRef.current !== null) window.clearTimeout(scrollSettleTimerRef.current);
      scrollSettleTimerRef.current = null;
      const timeout = programmaticScrollTimeouts.get(root);
      if (timeout) window.clearTimeout(timeout);
      programmaticScrollTimeouts.delete(root);
      delete root.dataset.programmaticScroll;
      updateActiveCategory();
    };

    const handleScroll = () => {
      if (root.dataset.programmaticScroll !== 'true') {
        updateActiveCategory();
        return;
      }

      if (scrollSettleTimerRef.current !== null) window.clearTimeout(scrollSettleTimerRef.current);
      scrollSettleTimerRef.current = window.setTimeout(finishProgrammaticScroll, 140);
    };

    root.addEventListener('scroll', handleScroll, { passive: true });
    root.addEventListener('scrollend', finishProgrammaticScroll);
    return () => {
      root.removeEventListener('scroll', handleScroll);
      root.removeEventListener('scrollend', finishProgrammaticScroll);
      if (scrollSettleTimerRef.current !== null) window.clearTimeout(scrollSettleTimerRef.current);
      scrollSettleTimerRef.current = null;
      const timeout = programmaticScrollTimeouts.get(root);
      if (timeout) window.clearTimeout(timeout);
      programmaticScrollTimeouts.delete(root);
    };
  }, [listRef, onActiveCategoryChange]);

  return (
    <div ref={listRef} className='scrollbar-hide min-h-0 flex-1 overflow-y-auto'>
      <div className='px-x4 pt-x7 gap-x8 flex flex-col'>
        {Object.entries(FILTER_CONFIG).map(([category, options]) => (
          <div key={category} data-filter-category={category} className='gap-x2 flex flex-col'>
            <h4 className='body1-bold text-text-primary'>{category}</h4>
            <div className='gap-x2_5 flex flex-wrap'>
              {options.map((option) => (
                <FilterChip
                  variant='toggle'
                  key={option}
                  activated={isSelected(option)}
                  onClick={() => onToggleOption(option)}
                >
                  {FILTER_OPTIONS[option]}
                </FilterChip>
              ))}
            </div>
          </div>
        ))}
        <div aria-hidden='true' style={{ height: bottomSpacerHeight, flexShrink: 0 }} />
      </div>
    </div>
  );
}
