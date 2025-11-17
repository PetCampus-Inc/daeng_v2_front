import { BottomSheet as BottomSheetPrimitive } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import React from 'react';

function BottomSheetRoot({ ...props }: React.ComponentProps<typeof BottomSheetPrimitive.Root>) {
  return <BottomSheetPrimitive.Root {...props} />;
}

function BottomSheetNestedRoot({ ...props }: React.ComponentProps<typeof BottomSheetPrimitive.NestedRoot>) {
  return <BottomSheetPrimitive.NestedRoot {...props} />;
}

function BottomSheetTrigger({ ...props }: React.ComponentProps<typeof BottomSheetPrimitive.Trigger>) {
  return <BottomSheetPrimitive.Trigger {...props} />;
}

function BottomSheetPortal({ ...props }: React.ComponentProps<typeof BottomSheetPrimitive.Portal>) {
  return <BottomSheetPrimitive.Portal {...props} />;
}

function BottomSheetOverlay({ className, ...props }: React.ComponentProps<typeof BottomSheetPrimitive.Overlay>) {
  return <BottomSheetPrimitive.Overlay className={cn('mx-auto max-w-screen-sm', className)} {...props} />;
}

function BottomSheetBody({ className, ...props }: React.ComponentProps<typeof BottomSheetPrimitive.Body>) {
  const [mounted, setMounted] = React.useState(false);

  React.useLayoutEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  return <BottomSheetPrimitive.Body className={cn('mx-auto max-w-screen-sm', className)} {...props} />;
}

function BottomSheetContent({ ...props }: React.ComponentProps<typeof BottomSheetPrimitive.Content>) {
  return <BottomSheetPrimitive.Content {...props} />;
}

function BottomSheetHandle({ ...props }: React.ComponentProps<typeof BottomSheetPrimitive.Handle>) {
  return <BottomSheetPrimitive.Handle {...props} />;
}

function BottomSheetHeader({ ...props }: React.ComponentProps<typeof BottomSheetPrimitive.Header>) {
  return <BottomSheetPrimitive.Header {...props} />;
}

function BottomSheetFooter({ ...props }: React.ComponentProps<typeof BottomSheetPrimitive.Footer>) {
  return <BottomSheetPrimitive.Footer {...props} />;
}

function BottomSheetTitle({ ...props }: React.ComponentProps<typeof BottomSheetPrimitive.Title>) {
  return <BottomSheetPrimitive.Title {...props} />;
}

function BottomSheetCloseButton({ ...props }: React.ComponentProps<typeof BottomSheetPrimitive.CloseButton>) {
  return <BottomSheetPrimitive.CloseButton {...props} />;
}

const Root = BottomSheetRoot;
const NestedRoot = BottomSheetNestedRoot;
const Trigger = BottomSheetTrigger;
const Portal = BottomSheetPortal;
const Overlay = BottomSheetOverlay;
const Body = BottomSheetBody;
const Content = BottomSheetContent;
const Handle = BottomSheetHandle;
const Header = BottomSheetHeader;
const Footer = BottomSheetFooter;
const Title = BottomSheetTitle;
const CloseButton = BottomSheetCloseButton;

export { Root, NestedRoot, Trigger, Portal, Overlay, Body, Content, Handle, Header, Footer, Title, CloseButton };
