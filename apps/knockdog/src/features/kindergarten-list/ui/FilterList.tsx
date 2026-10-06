import { useCallback, useEffect, useLayoutEffect, useState, type RefObject } from 'react';
import { FilterChip } from './FilterChip';
import { FILTER_CONFIG, FILTER_OPTIONS, type FilterCategory, type FilterOption } from '@entities/kindergarten';

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

  const scrollToCategory = useCallback((category: FilterCategory, behavior: ScrollBehavior = 'smooth') => {
    const root = listRef.current;
    const target = root?.querySelector<HTMLElement>(`[data-filter-category="${category}"]`);
    if (!root || !target) return;

    // scrollIntoView also scrolls the fixed bottom-sheet on some browsers,
    // moving its header and category tabs out of view. Scroll only the list.
    const rootTop = root.getBoundingClientRect().top;
    const targetTop = target.getBoundingClientRect().top;
    root.scrollTo({ top: root.scrollTop + targetTop - rootTop - 16, behavior });
  }, [listRef]);

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

    root.addEventListener('scroll', updateActiveCategory, { passive: true });
    return () => root.removeEventListener('scroll', updateActiveCategory);
  }, [onActiveCategoryChange]);

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
