import { Tooltip, TooltipContent, TooltipTrigger } from '@knockdog/ui';
import { PropsWithChildren, ReactNode } from 'react';

export function Label({
  children,
  tooltip,
  className = '',
}: PropsWithChildren<{ tooltip?: ReactNode; className?: string }>) {
  return (
    <div className={`text-text-primary body2-semibold mx-auto flex w-fit items-center gap-1 ${className}`}>
      {children}
      {tooltip && (
        <Tooltip className='flex items-center' placement='top-left'>
          <TooltipTrigger />
          <TooltipContent className='border-line-200 mr-10 ml-8 rounded-lg rounded-br-none border p-3 text-[11px] leading-4'>
            {tooltip}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
