import { ReactNode } from 'react';
import type { BaseSheetProps } from '../types';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from './Sheet';
import { cn } from '@knockdog/ui/lib';

interface SheetLayoutProps extends BaseSheetProps {
  footer: ReactNode;
}

const SheetLayout = ({
  open,
  onOpenChange,
  footer,
  side = 'bottom',
  showCloseButton = true,
  title,
  children,
  description,
  contentClassName,
}: SheetLayoutProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} showCloseButton={showCloseButton}>
        <SheetHeader>
          {title && <SheetTitle>{title}</SheetTitle>}
          <SheetDescription asChild>
            {children || (
              <span className={cn('text-center')}>{description}</span>
            )}
          </SheetDescription>
        </SheetHeader>
        <div className={cn('grid gap-4 py-4', contentClassName)}>
          <div className='grid grid-cols-4 items-center gap-4' />
        </div>
        <SheetFooter>{footer}</SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default SheetLayout;
