'use client';

import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';

import { cn } from '@knockdog/ui/lib';

function BottomSheetRoot({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot='bottom-sheet' {...props} />;
}

function BottomSheetNestedRoot({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.NestedRoot>) {
  return (
    <DrawerPrimitive.NestedRoot
      data-slot='bottom-sheet-nested-root'
      {...props}
    />
  );
}

function BottomSheetTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return (
    <DrawerPrimitive.Trigger data-slot='bottom-sheet-trigger' {...props} />
  );
}

function BottomSheetPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot='bottom-sheet-portal' {...props} />;
}

function BottomSheetClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot='bottom-sheet-close' {...props} />;
}

function BottomSheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot='bottom-sheet-overlay'
      className={cn('fixed inset-0 z-50 bg-black/40', className)}
      {...props}
    />
  );
}

function BottomSheetContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  // TODO: vaul patch 되면 서버환경 확인 코드 제거하기
  const isServer = typeof window === 'undefined' || 'Deno' in globalThis;
  if (isServer) return null;
  return (
    <DrawerPrimitive.Content
      data-slot='bottom-sheet-content'
      className={cn(
        'bg-primitive-neutral-0 fixed inset-x-0 bottom-0 z-50 w-full rounded-t-[16px] shadow-[0px_-16px_20px] shadow-black/5',
        className
      )}
      {...props}
    >
      {children}
    </DrawerPrimitive.Content>
  );
}

function BottomSheetHandle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Handle>) {
  return (
    <DrawerPrimitive.Handle
      data-slot='bottom-sheet-handle'
      className={cn(
        'bg-fill-secondary-400 mx-auto my-[12px] h-[5px] w-[36px] rounded-full',
        className
      )}
      {...props}
    />
  );
}

function BottomSheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot='bottom-sheet-header'
      className={cn('px-x5 relative flex h-[48px] items-center', className)}
      {...props}
    />
  );
}

function BottomSheetFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <footer
      data-slot='bottom-sheet-footer'
      className={cn('py-x5 flex flex-col px-4', className)}
      {...props}
    />
  );
}

function BottomSheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot='bottom-sheet-title'
      className={cn('h3-extrabold text-text-primary', className)}
      {...props}
    />
  );
}

export {
  BottomSheetRoot,
  BottomSheetNestedRoot,
  BottomSheetPortal,
  BottomSheetOverlay,
  BottomSheetHandle,
  BottomSheetTrigger,
  BottomSheetClose,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetFooter,
  BottomSheetTitle,
};
