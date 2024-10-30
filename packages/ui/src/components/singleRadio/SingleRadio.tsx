'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@knockdog/ui/lib';

const singleRadioStyles = cva('transition-all rounded-md p-2 border grow', {
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

interface SingleRadioProps {
  options: string[];
  value: string | null;
  onSelect: (value: string | null) => void;
  asChild?: boolean;
  disabled?: boolean;
}

const SingleRadio = ({
  options = [],
  asChild,
  value,
  onSelect,
  disabled = false,
}: SingleRadioProps) => {
  const Comp = asChild ? Slot : 'button';

  const handleSelect = (option: string) => {
    if (disabled) return;
    onSelect(value === option ? null : option);
  };

  return (
    <div className={cn('flex gap-x-2')}>
      {options.map((option) => {
        return (
          <Comp
            key={option}
            className={cn(
              singleRadioStyles({ selected: value === option, disabled })
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

export { SingleRadio };
