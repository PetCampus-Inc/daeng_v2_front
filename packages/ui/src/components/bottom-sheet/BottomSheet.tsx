'use client';

import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';

import { cn } from '@knockdog/ui/lib';
import { Icon } from '../icon';

function BottomSheetRoot({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot='bottom-sheet' {...props} />;
}

function BottomSheetNestedRoot({ ...props }: React.ComponentProps<typeof DrawerPrimitive.NestedRoot>) {
  return <DrawerPrimitive.NestedRoot data-slot='bottom-sheet-nested-root' {...props} />;
}

function BottomSheetTrigger({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot='bottom-sheet-trigger' {...props} />;
}

function BottomSheetPortal({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot='bottom-sheet-portal' {...props} />;
}
function BottomSheetOverlay({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot='bottom-sheet-overlay'
      className={cn('fixed inset-0 z-(--z-index-overlay) bg-black/40', className)}
      {...props}
    />
  );
}

function BottomSheetBody({ className, children, ...props }: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPrimitive.Content
      data-slot='bottom-sheet-body'
      className={cn(
        'bg-primitive-neutral-0 fixed inset-x-0 bottom-0 z-(--z-index-modal) max-h-[calc(100vh-72px)] w-full rounded-t-[16px] shadow-[0px_-16px_20px] shadow-black/5',
        className
      )}
      {...props}
    >
      {children}
    </DrawerPrimitive.Content>
  );
}

function BottomSheetContent({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return <div data-slot='bottom-sheet-content' className={cn('px-x6 py-x2', className)} {...props} />;
}

function BottomSheetHandle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Handle>) {
  return (
    <DrawerPrimitive.Handle
      data-slot='bottom-sheet-handle'
      className={cn('bg-fill-secondary-200 mx-auto mt-[12px] mb-[8px] h-[5px] w-[36px] rounded-full', className)}
      {...props}
    />
  );
}

function BottomSheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot='bottom-sheet-header'
      className={cn('px-x6 py-x3_5 relative flex items-center', className)}
      {...props}
    />
  );
}

function BottomSheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <footer data-slot='bottom-sheet-footer' className={cn('py-x5 flex flex-col px-6', className)} {...props} />;
}

function BottomSheetTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot='bottom-sheet-title'
      className={cn('h3-extrabold text-text-primary', className)}
      {...props}
    />
  );
}

function BottomSheetCloseButton({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return (
    <DrawerPrimitive.Close
      data-slot='bottom-sheet-close'
      className={cn('absolute right-4 flex cursor-pointer items-center justify-center', className)}
      {...props}
    >
      <Icon icon='Close' className='size-x6 text-fill-secondary-700' />
    </DrawerPrimitive.Close>
  );
}

export {
  BottomSheetRoot,
  BottomSheetNestedRoot,
  BottomSheetPortal,
  BottomSheetOverlay,
  BottomSheetHandle,
  BottomSheetTrigger,
  BottomSheetCloseButton,
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetFooter,
  BottomSheetTitle,
};
