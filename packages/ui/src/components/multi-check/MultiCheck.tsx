'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@knockdog/ui/lib';

const multiCheckStyles = cva(
  'transition-all rounded-md p-2 grow disabled:bg-gray5 disabled:cursor-not-allowed data-[selected=true]:border disabled:opacity-50 data-[selected=true]:bg-brown4 data-[selected=true]:border-brown3 data-[selected=true]:text-primary',
  {
    variants: {
      variant: {
        primary: 'border border-gray4 text-gray3',
        secondary: 'bg-gray4 text-gray2 border border-gray4',
      },
    },
    defaultVariants: { variant: 'primary' },
  }
);

type ThemeType = 'primary' | 'secondary';
interface MultiCheckProps {
  variant?: ThemeType;
  options: string[];
  selectedValues: string[];
  onSelect?: (values: string[]) => void;
  asChild?: boolean;
  disabled?: boolean;
}

const MultiCheck = ({
  variant = 'primary',
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
            data-selected={selectedValues.includes(option)}
            key={option}
            className={cn(
              multiCheckStyles({
                variant,
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
