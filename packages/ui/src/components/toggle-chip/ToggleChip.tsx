import { createContext, useContext } from 'react';
import { Checkbox, useCheckboxContext } from '@daeng-design/react-checkbox';
import { cva, type VariantProps } from 'class-variance-authority';

const toggleChipVariants = cva(
  'off:cursor-not-allowed radius-r2 [--chip-icon-color:theme(colors.text.primary)] px-x3 py-x2 focal:outline-none inline-flex cursor-pointer items-center justify-center transition-colors',
  {
    variants: {
      variant: {
        outline:
          'bg-fill-secondary-0 border-line-200 on:bg-fill-secondary-700 off:bg-fill-secondary-50 [--chip-icon-color:theme(colors.fill.secondary.600)] on:[--chip-icon-color:theme(colors.fill.primary.500)] off:[--chip-icon-color:theme(colors.fill.secondary.400)] off:border-none border-[1.4px]',
      },
    },
    defaultVariants: {
      variant: 'outline',
    },
  }
);

const toggleChipIconVariants = cva('inline-flex shrink-0 items-center justify-center', {
  variants: {
    slot: {
      prefix: 'pr-x1',
      suffix: 'pl-x1',
    },
  },
});

const chipLabelVariants = cva('align-center body2-semibold inline-flex justify-center', {
  variants: {
    variant: {
      outline: 'text-text-primary on:text-text-primary-inverse off:text-text-secondary-inverse',
    },
  },
});

type ToggleChipContextValue = VariantProps<typeof toggleChipVariants>;

const ToggleChipContext = createContext<ToggleChipContextValue | null>(null);
ToggleChipContext.displayName = 'ToggleChipContext';

function useToggleChipContext() {
  const context = useContext(ToggleChipContext);
  if (!context) {
    throw new Error('ToggleChip items must be used within a ToggleChip');
  }
  return context;
}

interface ToggleChipProps extends Checkbox.RootProps, VariantProps<typeof toggleChipVariants> {
  ref?: React.RefObject<HTMLInputElement>;
}

export function ToggleChip({ children, ref, variant, ...props }: ToggleChipProps) {
  return (
    <ToggleChipContext.Provider value={{ variant }}>
      <Checkbox.Root {...props} className={toggleChipVariants({ variant })}>
        {children}
      </Checkbox.Root>
    </ToggleChipContext.Provider>
  );
}
ToggleChip.displayName = 'ToggleChip';

export function ChipLabel({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  const { variant } = useToggleChipContext();
  const checkboxContext = useCheckboxContext({ strict: false });
  const stateProps = checkboxContext?.stateProps;

  return (
    <span {...stateProps} {...props} className={chipLabelVariants({ variant, className })}>
      {children}
    </span>
  );
}
ChipLabel.displayName = 'ToggleChip.Label';

export function ChipPrefixIcon({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const checkboxContext = useCheckboxContext({ strict: false });
  const stateProps = checkboxContext?.stateProps;

  return (
    <div
      {...stateProps}
      {...props}
      className={toggleChipIconVariants({ slot: 'prefix', className })}
      style={{ color: 'var(--chip-icon-color)', ...props.style }}
    >
      {children}
    </div>
  );
}
ChipPrefixIcon.displayName = 'ToggleChip.PrefixIcon';

export function ChipSuffixIcon({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const checkboxContext = useCheckboxContext({ strict: false });
  const stateProps = checkboxContext?.stateProps;

  return (
    <div
      {...stateProps}
      {...props}
      className={toggleChipIconVariants({ slot: 'suffix', className })}
      style={{ color: 'var(--chip-icon-color)', ...props.style }}
    >
      {children}
    </div>
  );
}
ChipSuffixIcon.displayName = 'ToggleChip.SuffixIcon';

export const Chip = Object.assign(
  {},
  {
    Toggle: ToggleChip,
    Label: ChipLabel,
    PrefixIcon: ChipPrefixIcon,
    SuffixIcon: ChipSuffixIcon,
  }
);
