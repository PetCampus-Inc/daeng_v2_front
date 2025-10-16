'use client';

import { cn } from '@knockdog/ui/lib';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';

interface ToastProviderProps extends ToastPrimitive.ToastProviderProps {
  className?: string;
}

function ToastProvider(props: ToastProviderProps) {
  const { swipeDirection = 'right', className, ...restProps } = props;

  return (
    <ToastPrimitive.Provider swipeDirection={swipeDirection} {...restProps}>
      <ToastPrimitive.Viewport className={cn('fixed z-[100] flex flex-col', className)} hotkey={['F8']} />
      {props.children}
    </ToastPrimitive.Provider>
  );
}

const toastVariants = cva(
  [
    'bg-fill-secondary-700 text-text-primary-inverse body1-medium data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-10 data-[state=closed]:slide-out-to-top-10 p-3 shadow-[0_0_10px_rgba(0,0,0,0.1)] data-[state=closed]:duration-300 data-[state=open]:duration-300',
    'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
    'data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform',
    'data-[swipe=end]:translate-x-[calc(100%+var(--viewport-padding,0px))] data-[swipe=end]:transition-transform',
  ],
  {
    variants: {
      variant: {
        rounded: [
          'radius-r1',
          'mx-3',
          'block',
          'w-[calc(100vw-1.5rem-constant(safe-area-inset-left)-constant(safe-area-inset-right))]',
          'w-[calc(100vw-1.5rem-env(safe-area-inset-left)-env(safe-area-inset-right))]',
        ],
        square: 'radius-r0 w-screen',
      },
    },
    defaultVariants: {
      variant: 'square',
    },
  }
);

interface ToastProps extends Omit<ToastPrimitive.ToastProps, 'title'> {
  className?: string;
  variant?: VariantProps<typeof toastVariants>['variant'];
  title?: React.ReactNode;
  description?: React.ReactNode;
}

function Toast(props: ToastProps) {
  const { className, variant, title, description, duration = 2000, ...restProps } = props;

  return (
    <ToastPrimitive.Root className={cn(toastVariants({ variant }), className)} duration={duration} {...restProps}>
      {title && <ToastPrimitive.Title>{title}</ToastPrimitive.Title>}
      {description && (
        <ToastPrimitive.Description className='caption1-regular'>{description}</ToastPrimitive.Description>
      )}
    </ToastPrimitive.Root>
  );
}

export { Toast, ToastProvider };
export type { ToastProps, ToastProviderProps };
