import React from 'react';
import * as Popper from '@radix-ui/react-popper';
import { Portal } from '@radix-ui/react-portal';
import { composeRefs } from '@radix-ui/react-compose-refs';
import { cn } from '@knockdog/ui/lib';
import type { PopperContentProps } from '@radix-ui/react-popper';

/* -------------------------------------------------------------------------------------------------
 * DropdownMenu
 * -----------------------------------------------------------------------------------------------*/

interface DropdownMenuContextProps {
  open: boolean;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement>;
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleOpen: () => void;
}

const DropdownMenuContext =
  React.createContext<DropdownMenuContextProps | null>(null);

function useDropdownMenuContext(component: string) {
  const context = React.useContext(DropdownMenuContext);
  if (!context)
    throw new Error(`${component} must be used within a DropdownMenu`);
  return context;
}

interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DROPDOWN_MENU_NAME = 'DropdownMenu';

const DropdownMenu = (props: DropdownMenuProps) => {
  const { children, open: controlledValue, defaultOpen, onOpenChange } = props;
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = React.useState(
    defaultOpen ?? false
  );
  const open = isControlled ? controlledValue : internalValue;

  const setOpen = React.useCallback(
    (nextValue: boolean | ((prev: boolean) => boolean)) => {
      const value =
        typeof nextValue === 'function'
          ? (nextValue as (prev: boolean) => boolean)(
              controlledValue ?? internalValue
            )
          : nextValue;

      if (isControlled) {
        if (value !== controlledValue) onOpenChange?.(value);
      } else {
        setInternalValue(value);
      }
    },
    [isControlled, controlledValue, internalValue, onOpenChange]
  );

  const toggleOpen = React.useCallback(() => {
    setOpen((prev) => !prev);
  }, [setOpen]);

  return (
    <DropdownMenuContext.Provider
      value={{ open, triggerRef, contentRef, setOpen, toggleOpen }}
    >
      <Popper.Root>{children}</Popper.Root>
    </DropdownMenuContext.Provider>
  );
};
DropdownMenu.displayName = DROPDOWN_MENU_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = 'DropdownMenuTrigger';

interface DropdownMenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(({ onClick, ...props }, ref) => {
  const { triggerRef, toggleOpen, open } = useDropdownMenuContext(
    'DropdownMenuTrigger'
  );

  return (
    <Popper.Anchor asChild>
      <button
        type='button'
        aria-haspopup='menu'
        aria-expanded={open}
        aria-controls='dropdown-menu-content'
        ref={composeRefs(ref, triggerRef)}
        onClick={(e) => {
          onClick?.(e);
          toggleOpen();
        }}
        {...props}
      />
    </Popper.Anchor>
  );
});

DropdownMenuTrigger.displayName = TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = 'DropdownMenuContent';

interface DropdownMenuContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    PopperContentProps {
  children: React.ReactNode;
}

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>((props, ref) => {
  const { open, triggerRef, contentRef, setOpen } = useDropdownMenuContext(
    'DropdownMenuContent'
  );
  const {
    side = 'bottom',
    sideOffset,
    align = 'end',
    alignOffset,
    collisionPadding,
    className,
    ...rest
  } = props;

  const popperProps = {
    side,
    sideOffset: 6,
    align,
    alignOffset,
    collisionPadding,
  };

  // 외부 클릭 감지
  // MEMO: 자주 사용되면 훅으로 빼기
  React.useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !contentRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <Portal asChild>
      <Popper.Content
        ref={composeRefs(ref, contentRef)}
        {...popperProps}
        data-state={open ? 'open' : 'closed'}
        className={cn(
          'text-gray2 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[118.50000000000001px -5px] border-gray4 z-50 max-h-[701px] min-w-[10rem] overflow-y-auto overflow-x-hidden rounded-[0.4rem] border bg-white',
          className
        )}
        style={{
          boxShadow: '0px 5px 15px 5px rgba(0, 0, 0, 0.13)',
        }}
        aria-orientation='vertical'
        tabIndex={-1}
        {...rest}
      >
        {props.children}
      </Popper.Content>
    </Portal>
  );
});

DropdownMenuContent.displayName = CONTENT_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuItem
 * -----------------------------------------------------------------------------------------------*/

const ITEM_NAME = 'DropdownMenuItem';

interface DropdownMenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  inset?: boolean;
}

const DropdownMenuItem = (props: DropdownMenuItemProps) => {
  const { children, onClick, inset, className } = props;
  const { setOpen } = useDropdownMenuContext('DropdownMenuItem');

  return (
    <button
      role='menuitem'
      onClick={(e) => {
        onClick?.(e);
        setOpen(false);
      }}
      className={cn(
        'focus:bg-BGray typo-label-14 after:bg-gray4 relative flex w-full cursor-default select-none items-center gap-1 whitespace-nowrap rounded-sm bg-white px-3 py-2.5 text-sm outline-none transition-colors after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:content-[""] last:after:content-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
        inset && 'pl-8',
        className
      )}
      tabIndex={-1}
      {...props}
    >
      {children}
    </button>
  );
};

DropdownMenuItem.displayName = ITEM_NAME;

/* -----------------------------------------------------------------------------------------------*/

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
};
export type { DropdownMenuProps };
