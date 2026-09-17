'use client';

import { Switch } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

interface AlarmToggleRowProps {
  title: string;
  description: string;
  pressed: boolean;
  disabled?: boolean;
  onPressedChange: (checked: boolean) => void;
  muted?: boolean;
}

function AlarmToggleRow({ title, description, pressed, disabled, onPressedChange, muted }: AlarmToggleRowProps) {
  return (
    <div className={cn('flex w-full items-center gap-2 py-4', muted && 'opacity-50')}>
      <div className='flex flex-1 flex-col justify-center'>
        <h4 className='body1-bold text-text-primary'>{title}</h4>
        <span className='text-text-secondary body2-regular'>{description}</span>
      </div>
      <Switch pressed={pressed} disabled={disabled} onPressedChange={onPressedChange} />
    </div>
  );
}

export { AlarmToggleRow };
