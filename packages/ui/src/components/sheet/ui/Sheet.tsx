'use client';

import * as SheetPrimitive from '@radix-ui/react-dialog';
import {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  HTMLAttributes,
} from 'react';
import { cn } from '@knockdog/ui/lib';
import { Icon } from '../../icon';

import { cva, type VariantProps } from 'class-variance-authority';

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;
const SheetOverlay = forwardRef<
  ElementRef<typeof SheetPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...restProps }, ref) => {
  return (
    <SheetPrimitive.Overlay
      ref={ref}
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/40',
        className
      )}
      {...restProps}
    />
  );
});

SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  'fixed z-50 gap-4 bg-white p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out',
  {
    variants: {
      side: {
        top: 'rounded-b-lg inset-x-0 top-0  data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom:
          'rounded-t-lg inset-x-0 bottom-0  data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4  data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
        right:
          'inset-y-0 right-0 h-full w-3/4  data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
      },
    },
    defaultVariants: {
      side: 'bottom',
    },
  }
);

export interface SheetContentProps
  extends ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  showCloseButton?: boolean;
}

const SheetContent = forwardRef<
  ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(
  (
    {
      side = 'bottom',
      showCloseButton = true,
      className,
      children,
      ...restProps
    },
    ref
  ) => {
    return (
      <SheetPortal>
        <SheetOverlay />
        <SheetPrimitive.Content
          ref={ref}
          className={cn(sheetVariants({ side }), className)}
          {...restProps}
        >
          {showCloseButton && (
            <SheetPrimitive.Close className='absolute right-4 top-4 opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none'>
              <Icon icon='Alldogs' />
              <span className='sr-only'>Close</span>
            </SheetPrimitive.Close>
          )}
          {children}
        </SheetPrimitive.Content>
      </SheetPortal>
    );
  }
);

SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...restProps
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'flex flex-col space-y-2 text-center sm:text-left',
        className
      )}
      {...restProps}
    />
  );
};

SheetHeader.displayName = 'SheetHeader';

const SheetFooter = ({
  className,
  ...restProps
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
        className
      )}
      {...restProps}
    />
  );
};

SheetFooter.displayName = 'SheetFooter';

const SheetTitle = forwardRef<
  ElementRef<typeof SheetPrimitive.Title>,
  ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...restProps }, ref) => {
  return (
    <SheetPrimitive.Title
      ref={ref}
      className={cn('text-center text-lg font-semibold', className)}
      {...restProps}
    />
  );
});

const SheetDescription = forwardRef<
  ElementRef<typeof SheetPrimitive.Description>,
  ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...restProps }, ref) => {
  return (
    <SheetPrimitive.Description
      ref={ref}
      className={cn('text-gray2 text-base', className)}
      {...restProps}
    />
  );
});

SheetDescription.displayName = SheetPrimitive.Description.displayName;
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
