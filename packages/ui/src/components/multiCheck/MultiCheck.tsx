'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@knockdog/ui/lib';

const multiCheckStyles = cva('transition-all rounded-md p-2 border grow', {
  variants: {
    selected: {
      true: 'border-brown3 bg-brown4 text-primary',
      false: 'border-gray4 text-gray3',
    },
    disabled: {
      true: 'disabled:bg-gray5 cursor-not-allowed opacity-50',
      false: '',
    },
  },
  defaultVariants: {
    selected: false,
    disabled: false,
  },
});

interface MultiCheckProps {
  options: string[];
  selectedValues: string[];
  onSelect?: (values: string[]) => void;
  asChild?: boolean;
  disabled?: boolean;
}

const MultiCheck = ({
  options = [],
  asChild,
  selectedValues = [],
  onSelect = () => {},
  disabled = false,
}: MultiCheckProps) => {
  const Comp = asChild ? Slot : 'button';

  const handleSelect = (option: string) => {
    if (disabled) return;

    const updatedValues = selectedValues.includes(option)
      ? selectedValues.filter((item) => item !== option)
      : [...selectedValues, option];

    onSelect(updatedValues);
  };

  return (
    <div className={cn('flex gap-x-2')}>
      {options.map((option) => {
        return (
          <Comp
            key={option}
            className={cn(
              multiCheckStyles({
                selected: selectedValues.includes(option),
                disabled,
              })
            )}
            onClick={() => !disabled && handleSelect(option)}
            disabled={disabled}
          >
            {option}
          </Comp>
        );
      })}
    </div>
  );
};

export { MultiCheck };
