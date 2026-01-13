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
import { cn } from '@knockdog/ui/lib';
import { useState, useRef } from 'react';
import { RemoveScroll } from 'react-remove-scroll';

interface DropdownOption<T> {
  value: T;
  label: string;
  displayLabel?: string;
}

interface DropdownProps<T> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  maxLabelLength?: number;
  triggerClassName?: string;
  menuClassName?: string;
  labelClassName?: string;
  iconClassName?: string;
}

function Dropdown<T>({
  options,
  value,
  onChange,
  maxLabelLength,
  triggerClassName = '',
  menuClassName = '',
  labelClassName = '',
  iconClassName = '',
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = options[selectedIndex];

  const getDisplayLabel = () => {
    if (!selectedOption) return '';

    const baseLabel = selectedOption.displayLabel ?? selectedOption.label;
    return maxLabelLength ? baseLabel.slice(0, maxLabelLength) : baseLabel;
  };

  const selectedLabel = getDisplayLabel();

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
      {/* 트리거 버튼 */}
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        type='button'
        role='combobox'
        aria-expanded={isOpen}
        className={cn(`relative flex shrink-0 items-center justify-center gap-1 py-2 pl-3 ${triggerClassName}`)}
      >
        <span className={cn(`pointer-none text-text-primary body2-bold ${labelClassName}`)}>{selectedLabel}</span>
        <span className={isOpen ? 'rotate-180' : 'rotate-0'}>
          <Icon icon='ChevronBottom' className={cn(`text-fill-secondary-400 h-5 w-5 ${iconClassName}`)} />
        </span>
      </button>

      {/* 옵션 목록 */}
      {isOpen && (
        <RemoveScroll forwardProps>
          <FloatingFocusManager context={context} modal={false}>
            <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()} className='z-999'>
              <ul
                className={cn(
                  `bg-bg-0 border-line-200 flex min-w-[111px] flex-col gap-3 rounded-lg border p-3 ${menuClassName}`
                )}
              >
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
                    {index === selectedIndex && <Icon icon='Check' className='text-fill-primary-500 h-4 w-4' />}
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

export { Dropdown };
