'use client';

import * as React from 'react';
import { forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { composeRefs } from '@radix-ui/react-compose-refs';
import { useTooltip, type UseTooltipProps } from './use-tooltip';
import { TooltipProvider, useTooltipContext } from './use-tooltip-context';

export interface TooltipRootProps extends UseTooltipProps, React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const TooltipRoot = forwardRef<HTMLDivElement, TooltipRootProps>((props, ref) => {
  const {
    open,
    defaultOpen,
    onOpenChange,
    placement,
    offset,
    autoCloseMs,
    closeOnOutsideClick,
    closeOnEsc,
    children,
    ...otherProps
  } = props;

  const api = useTooltip({
    open,
    defaultOpen,
    onOpenChange,
    placement,
    offset,
    autoCloseMs,
    closeOnOutsideClick,
    closeOnEsc,
  });

  return (
    <TooltipProvider value={api}>
      <div ref={ref} {...otherProps}>
        {children}
      </div>
    </TooltipProvider>
  );
});
TooltipRoot.displayName = 'TooltipRoot';

export interface TooltipTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  disabled?: boolean;
}

export const TooltipTrigger = forwardRef<HTMLButtonElement, TooltipTriggerProps>((props, ref) => {
  const { asChild, disabled, children, ...otherProps } = props;
  const { open, setOpen, triggerRef, triggerProps, id } = useTooltipContext();

  const handlePointerDown: React.PointerEventHandler<HTMLButtonElement> = (e) => {
    if (disabled) return;
    triggerProps.onPointerDown?.(e);
  };

  const mergedProps = {
    ...triggerProps,
    ...otherProps,
    ref: composeRefs(ref, triggerRef as React.Ref<HTMLButtonElement>),
    onPointerDown: handlePointerDown,
    disabled,
    type: 'button' as const,
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(
      children as React.ReactElement,
      {
        ...mergedProps,
        onPointerDown: (children as any).props?.onPointerDown
          ? (e: React.PointerEvent<Element>) => {
              (children as any).props.onPointerDown?.(e);
              if (!e.defaultPrevented) {
                handlePointerDown(e as React.PointerEvent<HTMLButtonElement>);
              }
            }
          : (e: React.PointerEvent<Element>) => {
              handlePointerDown(e as React.PointerEvent<HTMLButtonElement>);
            },
      } as any
    );
  }

  return <button {...mergedProps}>{children}</button>;
});
TooltipTrigger.displayName = 'TooltipTrigger';

export interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  portal?: boolean;
}

export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>((props, ref) => {
  const { portal = true, children, ...otherProps } = props;
  const { open, contentRef, contentProps } = useTooltipContext();

  if (!open) return null;

  const { ref: _, ...restContentProps } = contentProps;

  const content = (
    <div ref={composeRefs(ref, contentRef as React.Ref<HTMLDivElement>)} {...restContentProps} {...otherProps}>
      {children}
    </div>
  );

  if (portal && typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }

  return content;
});
TooltipContent.displayName = 'TooltipContent';
