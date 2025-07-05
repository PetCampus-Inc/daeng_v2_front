'use client';

import * as React from 'react';
import {
  type ContentProps,
  type DialogProps,
  type HandleProps,
  Drawer as DrawerPrimitive,
} from 'vaul';

import { cn } from '@knockdog/ui/lib';

type BottomSheetRootProps = DialogProps;

const BottomSheetRoot = (props: BottomSheetRootProps) => (
  <DrawerPrimitive.Root {...props} />
);
BottomSheetRoot.displayName = 'BottomSheetRoot';

const BottomSheetNestedRoot = DrawerPrimitive.NestedRoot;

const BottomSheetTrigger = DrawerPrimitive.Trigger;

const BottomSheetPortal = DrawerPrimitive.Portal;

const BottomSheetClose = DrawerPrimitive.Close;

const BottomSheetOverlay = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/40', className)}
    {...props}
  />
));
BottomSheetOverlay.displayName = DrawerPrimitive.Overlay.displayName;

type BottomSheetContentProps = ContentProps;

const BottomSheetContent = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Content>,
  BottomSheetContentProps
>(({ className, children, ...props }, ref) => (
  <DrawerPrimitive.Content
    ref={ref}
    className={cn(
      'bg-primitive-neutral-0 fixed inset-x-0 bottom-0 z-50 w-full rounded-t-[16px] shadow-[0px_-16px_20px] shadow-black/5',
      className
    )}
    {...props}
  >
    {children}
  </DrawerPrimitive.Content>
));
BottomSheetContent.displayName = 'BottomSheetContent';

type BottomSheetHandleProps = HandleProps;

const BottomSheetHandle = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Handle>,
  BottomSheetHandleProps
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Handle
    ref={ref}
    className={cn(
      'bg-fill-secondary-400 mx-auto my-[12px] h-[5px] w-[36px] rounded-full',
      className
    )}
    {...props}
  />
));
BottomSheetHandle.displayName = 'BottomSheetHandle';

const BottomSheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'px-x5 relative flex h-[48px] items-center justify-center',
      className
    )}
    {...props}
  />
);
BottomSheetHeader.displayName = 'BottomSheetHeader';

const BottomSheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <footer className={cn('py-x5 flex flex-col px-4', className)} {...props} />
);
BottomSheetFooter.displayName = 'BottomSheetFooter';

const BottomSheetTitle = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn('h3-extrabold text-text-primary', className)}
    {...props}
  />
));
BottomSheetTitle.displayName = DrawerPrimitive.Title.displayName;

const BottomSheetDescription = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn('text-muted-foreground text-sm', className)}
    {...props}
  />
));
BottomSheetDescription.displayName = DrawerPrimitive.Description.displayName;

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
  BottomSheetDescription,
};
export type {
  BottomSheetRootProps,
  BottomSheetContentProps,
  BottomSheetHandleProps,
};
