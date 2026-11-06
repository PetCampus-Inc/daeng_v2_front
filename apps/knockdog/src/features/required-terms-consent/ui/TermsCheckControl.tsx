import { Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

interface TermsMasterCheckControlProps {
  checked: boolean;
}

function TermsMasterCheckControl({ checked }: TermsMasterCheckControlProps) {
  return (
    <span className='flex shrink-0 items-center justify-center p-[3px]' aria-hidden>
      <span
        className={cn(
          'flex size-[18px] items-center justify-center rounded-[4px] border',
          checked ? 'border-fill-primary-500 bg-fill-primary-500' : 'border-line-400 bg-bg-0'
        )}
      >
        {checked ? <Icon icon='Check' className='size-3.5 text-white' /> : null}
      </span>
    </span>
  );
}

interface TermsItemCheckControlProps {
  checked: boolean;
}

function TermsItemCheckControl({ checked }: TermsItemCheckControlProps) {
  return (
    <Icon
      icon='Check'
      className={cn('size-6 shrink-0', checked ? 'text-text-accent' : 'text-text-tertiary')}
      aria-hidden
    />
  );
}

export { TermsMasterCheckControl, TermsItemCheckControl };
