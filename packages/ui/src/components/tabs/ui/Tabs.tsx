import { Slot, Slottable } from '@radix-ui/react-slot';
import React, {
  createContext,
  useContext,
  useId,
  useState,
  forwardRef,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { cn } from '@knockdog/ui/lib';
import {
  tabsIndicatorVariants,
  tabsListVariants,
  tabsTriggerVariants,
} from './styles';
import type { VariantProps } from 'class-variance-authority';

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

type TabsContextValue = {
  baseId: string;
  value: string | undefined;
  onValueChange: (value: string) => void;
  variant: 'underline' | 'divider';
};

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = (component: string) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(`${component} must be used within a Tabs`);
  }
  return context;
};

/* -------------------------------------------------------------------------------------------------
 * Tabs
 * -----------------------------------------------------------------------------------------------*/

type TabsProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (newValue: string) => void;
  variant?: 'underline' | 'divider';
  children?: React.ReactNode;
};

const TABS = 'Tabs';

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onValueChange,
      variant = 'underline',
      ...props
    },
    ref
  ) => {
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const baseId = useId();

    const value = isControlled ? controlledValue : internalValue;

    const handleValueChange = (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    };

    return (
      <TabsContext.Provider
        value={{
          baseId,
          value,
          onValueChange: handleValueChange,
          variant,
        }}
      >
        <div ref={ref} {...props}>
          {props.children}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = TABS;

/* -------------------------------------------------------------------------------------------------
 * TabsList
 * -----------------------------------------------------------------------------------------------*/

const TABS_LIST = 'TabsList';
interface TabsListProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsListVariants>,
    VariantProps<typeof tabsIndicatorVariants> {}

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ margin, gap, align, className, ...props }, ref) => {
    const { baseId, value: selectedValue, variant } = useTabsContext(TABS_LIST);

    const tabsListRef = useRef<HTMLDivElement | null>(null);
    const [indicatorStyle, setIndicatorStyle] = useState({
      width: 0,
      left: 0,
    });

    const updateIndicator = useCallback(() => {
      if (variant !== 'underline' || !tabsListRef.current || !selectedValue)
        return;

      const activeTab = tabsListRef.current.querySelector<HTMLElement>(
        '[data-state="active"]'
      );
      if (!activeTab) return;

      const tabsRect = tabsListRef.current.getBoundingClientRect();
      const activeRect = activeTab.getBoundingClientRect();

      setIndicatorStyle({
        width: activeRect.width,
        left: activeRect.left - tabsRect.left,
      });
    }, [selectedValue]);

    useEffect(() => {
      if (variant !== 'underline') return;

      // Initial update
      const timeoutId = setTimeout(updateIndicator, 0);

      window.addEventListener('resize', updateIndicator);
      const observer = new MutationObserver(updateIndicator);

      if (tabsListRef.current) {
        observer.observe(tabsListRef.current, {
          attributes: true,
          childList: true,
          subtree: true,
        });
      }

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', updateIndicator);
        observer.disconnect();
      };
    }, [updateIndicator]);

    return (
      <div className='relative w-full' ref={tabsListRef}>
        <div
          ref={ref}
          role='tablist'
          id={`${baseId}-list`}
          className={cn(
            tabsListVariants({ margin, gap, align, variant }),
            className
          )}
          {...props}
        >
          {props.children}
        </div>
        {variant === 'underline' && (
          <span
            className={tabsIndicatorVariants({ variant })}
            style={indicatorStyle}
          />
        )}
      </div>
    );
  }
);

TabsList.displayName = TABS_LIST;

/* -------------------------------------------------------------------------------------------------
 * TabsTrigger
 * -----------------------------------------------------------------------------------------------*/

const TABS_TRIGGER = 'TabsTrigger';
interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tabsTriggerVariants> {
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  (
    { value, disabled = false, padding, className, icon, children, ...props },
    ref
  ) => {
    const {
      baseId,
      value: selectedValue,
      onValueChange,
      variant,
    } = useTabsContext(TABS_TRIGGER);

    const isSelected = value === selectedValue;

    const handleClick = () => {
      if (!disabled) {
        onValueChange(value);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onValueChange(value);
      }
    };

    return (
      <Slot>
        <button
          ref={ref}
          role='tab'
          aria-selected={isSelected}
          aria-controls={`${baseId}-content-${value}`}
          data-state={isSelected ? 'active' : 'inactive'}
          data-disabled={disabled ? '' : undefined}
          disabled={disabled}
          id={`${baseId}-trigger-${value}`}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={cn(
            'group',
            tabsTriggerVariants({ variant, padding }),
            className
          )}
          {...props}
        >
          {/* MEMO: svg 색 변경 방식 다른 방법도 고려 필요 */}
          {icon && (
            <span className='mr-4 flex shrink-0 items-center'>
              {React.isValidElement(icon)
                ? React.cloneElement(icon, {
                    ...icon.props,
                    className: cn(
                      icon.props.className,
                      'transition-colors',
                      isSelected ? 'text-primary' : 'text-gray4'
                    ),
                  })
                : icon}
            </span>
          )}

          <Slottable>{children}</Slottable>
        </button>
      </Slot>
    );
  }
);

TabsTrigger.displayName = TABS_TRIGGER;

/* -------------------------------------------------------------------------------------------------
 * TabsContent
 * -----------------------------------------------------------------------------------------------*/

const TABS_CONTENT = 'TabsContent';

type TabsContentProps = {
  value: string;
  children: React.ReactNode;
};

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, children, ...props }, ref) => {
    const { baseId, value: selectedValue } = useTabsContext(TABS_CONTENT);
    const isSelected = value === selectedValue;

    if (!isSelected) {
      return null;
    }

    return (
      <div
        ref={ref}
        role='tabpanel'
        aria-labelledby={`${baseId}-trigger-${value}`}
        id={`${baseId}-content-${value}`}
        tabIndex={0}
        data-state={isSelected ? 'active' : 'inactive'}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabsContent.displayName = TABS_CONTENT;

export { Tabs, TabsList, TabsTrigger, TabsContent };

export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps };
