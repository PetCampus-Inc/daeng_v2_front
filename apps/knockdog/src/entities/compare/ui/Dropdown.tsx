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
        className='relative flex shrink-0 items-center justify-center border-b pb-0.5'
      >
        <span className='h2-extrabold text-text-primary'>{selectedOptionLabel}</span>
        <span className={isOpen ? 'rotate-180' : 'mt-1 rotate-0'}>
          <Icon icon='ChevronBottom' className='text-text-primary h-5 w-5' />
        </span>
      </button>

      {isOpen && (
        <RemoveScroll forwardProps>
          <FloatingFocusManager context={context} modal={false}>
            {/* eslint-disable-next-line react-hooks/refs */}
            <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()} className='z-999'>
              <ul className='bg-bg-0 border-line-200 flex w-[111px] flex-col gap-3 rounded-lg border p-3'>
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
                    className={`flex cursor-pointer items-center gap-1 ${
                      index === selectedIndex ? 'body2-bold text-text-accent' : 'body2-regular text-text-primary'
                    }`}
                  >
                    <span className='truncate'>{option.label}</span>
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
