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

interface DropdownProps<T> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

const MAX_LABEL_LENGTH = 5;

export function Dropdown<T>({ options, value, onChange }: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOptionLabel = options[selectedIndex]?.label.slice(0, MAX_LABEL_LENGTH) ?? '';

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
    const selectedOption = options[index];
    if (selectedOption) {
      onChange(selectedOption.value);
    }
    setIsOpen(false);
  };

  return (
    <>
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        type='button'
        role='combobox'
        aria-expanded={isOpen}
        className='relative flex items-center justify-center'
      >
        <span className='h2-extrabold text-orange-500'>{selectedOptionLabel}</span>
        <span className={isOpen ? 'rotate-180' : 'mt-1 rotate-0'}>
          <Icon icon='ChevronBottom' className='text-text-primary h-5 w-5' />
        </span>
      </button>

      {isOpen && (
        <RemoveScroll forwardProps>
          <FloatingFocusManager context={context} modal={false}>
            {/* eslint-disable-next-line react-hooks/refs */}
            <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()} className='z-999'>
              <ul className='py-x1.5 px-x1.5 bg-bg-0 radius-r2 gap-x1.5 flex w-[111px] flex-col shadow-[0px_1px_6px_0px_rgba(16,24,40,0.12)]'>
                {options.map((option, index) => (
                  <li
                    key={String(option.value)}
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
                    className={`gap-x1 px-x1.5 py-x1 radius-r1 hover:bg-fill-secondary-50 flex cursor-pointer items-center transition-colors ${
                      index === selectedIndex ? 'body2-bold text-text-accent' : 'body2-regular text-text-primary'
                    }`}
                  >
                    <span className='flex-1 truncate'>{option.label}</span>
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
