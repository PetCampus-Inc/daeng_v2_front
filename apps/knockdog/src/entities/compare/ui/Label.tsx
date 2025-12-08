import { Tooltip, TooltipContent, TooltipTrigger } from '@knockdog/ui';
import { PropsWithChildren } from 'react';

export function Label({
  children,
  tooltip,
  className = '',
}: PropsWithChildren<{ tooltip?: string; className?: string }>) {
  return (
    <div className={`text-text-primary body2-semibold mx-auto flex w-fit items-center gap-1 ${className}`}>
      {children}
      {tooltip && (
        <Tooltip className='flex items-center'>
          <TooltipTrigger />
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
