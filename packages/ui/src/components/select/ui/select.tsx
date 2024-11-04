'use client';
import React, {
  ReactNode,
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import ReactDOM from 'react-dom';
import { cn, composeEventHandlers } from '@knockdog/ui/lib';
import { shouldShowPlaceholder } from '../lib/helpers';
import { Icon } from '../../icon';

// Select Context Value Type
type SelectContextValue = {
  value?: string;
  selectedLabel?: string;
  onValueChange(value: string, label?: string): void;
  open: boolean;
  onOpenChange(open: boolean): void;
  required?: boolean;
  disabled?: boolean;
  portalRef: React.RefObject<HTMLDivElement>;
};

// Create Select Context
const SelectContext = createContext<SelectContextValue | undefined>(undefined);

// Hook to use Select Context
const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('useSelectContext must be used within a SelectProvider');
  }
  return context;
};

// Select Props Interface
interface SelectProps {
  children?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?(value: string, label?: string): void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?(open: boolean): void;
  name?: string;
  autoComplete?: string;
  disabled?: boolean;
  required?: boolean;
  form?: string;
}

// Select Component
const Select = ({
  children,
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  disabled = false,
  required = false,
}: SelectProps) => {
  const [currentValue, setCurrentValue] = useState<string | undefined>(
    value ?? defaultValue
  );
  const [selectedLabel, setSelectedLabel] = useState<string | undefined>();
  const [isOpen, setIsOpen] = useState<boolean>(open ?? defaultOpen ?? false);
  const portalRef = useRef<HTMLDivElement | null>(null);

  const handleValueChange = useCallback(
    (newValue: string, label?: string) => {
      if (value !== undefined) {
        setCurrentValue(newValue);
        setSelectedLabel(label);
      }
      onValueChange?.(newValue, label);
    },
    [value, onValueChange]
  );

  const handleOpenChange = useCallback(
    (openState: boolean) => {
      if (open === undefined) {
        setIsOpen(openState);
      }
      onOpenChange?.(openState);
    },
    [open, onOpenChange]
  );

  return (
    <div>
      <SelectContext.Provider
        value={{
          portalRef,
          value: currentValue,
          onValueChange: handleValueChange,
          selectedLabel,
          open: isOpen,
          onOpenChange: handleOpenChange,
          disabled,
          required,
        }}
      >
        {children}
        <div ref={portalRef} />
      </SelectContext.Provider>
    </div>
  );
};

interface SelectPortalProps {
  children: React.ReactNode;
  container?: HTMLElement | null;
}

const SelectPortal: React.FC<SelectPortalProps> = ({ children, container }) => {
  if (!container) return null;
  return ReactDOM.createPortal(children, container);
};

// Select Trigger Component
interface SelectTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
}
const SelectTrigger = ({
  children,
  className,
  ...restProps
}: SelectTriggerProps) => {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const { open, onOpenChange, disabled, portalRef } = useSelectContext();

  const handleOpen = useCallback(() => {
    if (!disabled) {
      onOpenChange(!open);
    }
  }, [disabled, open, onOpenChange]);

  useEffect(() => {
    if (triggerRef.current) {
      const width = triggerRef.current.offsetWidth;
      if (portalRef.current) {
        portalRef.current.style.width = `${width}px`;
      }
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        portalRef.current &&
        !portalRef.current.contains(event.target as Node)
      ) {
        onOpenChange(false); // 외부 클릭 시 닫기
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onOpenChange, portalRef]);

  return (
    <button
      type='button'
      role='combobox'
      ref={triggerRef}
      className={cn(
        'border-gray3 text-darkBlack disabled:border-gray4 disabled:text-gray3 ring-offset-background h-48px focus:border-brown2 focus:text-brown2 rounded-md border px-3 py-2',
        className
      )}
      onClick={composeEventHandlers(restProps.onClick, (event) => {
        const typedEvent = event as unknown as MouseEvent;
        (typedEvent.currentTarget as HTMLButtonElement).focus();

        handleOpen();
      })}
      disabled={disabled}
    >
      <div className={cn('flex items-center justify-between')}>
        {children}
        <Icon icon='ArrowDown' className={disabled ? 'text-gray3' : ''} />
      </div>
    </button>
  );
};

// Select Value Component
interface SelectValueProps {
  placeholder?: string;
}

const SelectValue = ({ placeholder = '' }: SelectValueProps) => {
  const { value, selectedLabel } = useSelectContext();
  return (
    <span style={{ pointerEvents: 'none' }}>
      {shouldShowPlaceholder(value) ? (
        <>{placeholder}</>
      ) : (
        (selectedLabel ?? value)
      )}
    </span>
  );
};

// Select Content Component
interface SelectContentProps {
  children: ReactNode;
  className?: string;
}

const SelectContent = ({ children, className }: SelectContentProps) => {
  const { open, onOpenChange, portalRef } = useSelectContext();

  useEffect(() => {
    const close = () => onOpenChange(false);
    window.addEventListener('blur', close);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('blur', close);
      window.removeEventListener('resize', close);
    };
  }, [open, onOpenChange]);
  if (!open) return null;

  return (
    <SelectPortal container={portalRef.current}>
      <div
        className={cn(
          'border-gray3 absolute z-50 mt-1 max-h-48 overflow-y-auto rounded-md border bg-white shadow-lg',
          className
        )}
        style={{ width: portalRef.current?.style.width }}
        onClick={(e) => e.stopPropagation()} // 내부 클릭 시 이벤트 전파 방지
      >
        {children}
      </div>
    </SelectPortal>
  );
};

// Select Item Component
interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children?: React.ReactNode;
  className?: string;
}

const SelectItem = ({ value, children, className }: SelectItemProps) => {
  const {
    onValueChange,
    onOpenChange,
    value: selectedValue,
    open,
  } = useSelectContext();

  const itemRef = useRef<HTMLDivElement | null>(null);

  const handleSelect = useCallback(() => {
    onValueChange(value, children as string);
    onOpenChange(false);
  }, [value, children, onValueChange, onOpenChange]);

  useEffect(() => {
    if (open && value === selectedValue && itemRef.current) {
      itemRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }, [open, selectedValue, value]);

  return (
    <div
      ref={itemRef}
      role='option'
      onClick={handleSelect}
      className={cn(
        'hover:bg-gray4 border-gray3 relative flex w-full cursor-default select-none items-center border-b py-1.5 pl-8 pr-2 last:border-b-0',
        'first:rounded-t-md first:pt-2 last:rounded-b-md last:border-b-0 last:pb-2',
        value === selectedValue ? 'bg-gray4' : 'hover:bg-gray4', // 선택된 항목일 때 bg-gray4
        className
      )}
    >
      <span>{children}</span>
    </div>
  );
};

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  useSelectContext,
  SelectPortal,
};
