import {
  useFloating,
  useInteractions,
  useClick,
  useDismiss,
  useRole,
  useListNavigation,
  offset,
  flip,
  shift,
  autoUpdate,
  FloatingFocusManager,
} from '@floating-ui/react';

import { Icon } from '@knockdog/ui';
import { useState, useRef } from 'react';
import { RemoveScroll } from 'react-remove-scroll';

interface SortOption {
  id: string;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { id: 'distance', label: '거리순' },
  { id: 'review', label: '리뷰 많은 순' },
];

export function SortSelect() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { refs, floatingStyles, context } = useFloating({
    placement: 'bottom-end',
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(0), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const listItemsRef = useRef<Array<HTMLLIElement | null>>([]);

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    useClick(context),
    useDismiss(context, {
      outsidePress: true,
      outsidePressEvent: 'pointerdown',
    }),
    useRole(context, { role: 'listbox' }),
    useListNavigation(context, {
      listRef: listItemsRef,
      activeIndex,
      selectedIndex,
      onNavigate: setActiveIndex,
    }),
  ]);

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    setIsOpen(false);
  };

  const selectedOption = SORT_OPTIONS[selectedIndex];

  return (
    <>
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        type='button'
        role='combobox'
        aria-expanded={isOpen}
        className='py-x2 pl-x3 gap-x1 relative flex items-center justify-between'
      >
        <span className='pointer-none body2-regular text-text-primary'>{selectedOption?.label}</span>
        <Icon icon='ChevronBottom' className={`size-x5 text-fill-secondary-400 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <RemoveScroll forwardProps>
          <FloatingFocusManager context={context} modal={false}>
            <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()} className='z-[999]'>
              <ul className='py-x1_5 px-x1_5 bg-bg-0 radius-r2 gap-x1_5 flex w-[111px] flex-col shadow-[0px_1px_6px_0px_rgba(16,24,40,0.12)]'>
                {SORT_OPTIONS.map((option, index) => (
                  <li
                    key={option.id}
                    ref={(node) => {
                      listItemsRef.current[index] = node;
                    }}
                    {...getItemProps({
                      onClick: (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleSelect(index);
                      },
                      role: 'option',
                      'aria-selected': index === selectedIndex,
                    })}
                    className={`gap-x1 px-x1_5 py-x1 radius-r1 hover:bg-fill-secondary-50 flex cursor-pointer items-center transition-colors ${
                      index === selectedIndex ? 'body2-bold text-text-accent' : 'body2-regular text-text-primary'
                    }`}
                  >
                    {option.label}
                    {index === selectedIndex && <Icon icon='Check' className='size-x4 text-fill-primary-500' />}
                  </li>
                ))}
              </ul>
            </div>
          </FloatingFocusManager>
        </RemoveScroll>
      )}
    </>
  );
}
