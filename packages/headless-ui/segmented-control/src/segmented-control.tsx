import * as React from 'react';
import { composeRefs } from '@radix-ui/react-compose-refs';
import {
  useSegmentedControl,
  type UseSegmentedControlProps,
  type UseSegmentedControlItemProps,
} from './use-segmented-control';
import {
  SegmentedControlContext,
  SegmentedControlItemContext,
  useSegmentedControlContext,
  useSegmentedControlItemContext,
} from './use-segmented-control-context';

interface SegmentedControlRootProps
  extends UseSegmentedControlProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue'> {}

const SegmentedControlRoot = React.forwardRef<
  HTMLDivElement,
  SegmentedControlRootProps
>((props, ref) => {
  const {
    value,
    defaultValue,
    onValueChange,
    disabled,
    name,
    form,
    children,
    ...restProps
  } = props;

  const api = useSegmentedControl({
    value,
    defaultValue,
    onValueChange,
    disabled,
    name,
    form,
  });

  return (
    <SegmentedControlContext.Provider value={api}>
      <div
        ref={composeRefs(api.refs.root, ref)}
        {...api.getRootProps()}
        {...restProps}
      >
        {children}
      </div>
    </SegmentedControlContext.Provider>
  );
});
SegmentedControlRoot.displayName = 'SegmentedControl';

interface SegmentedControlItemProps
  extends UseSegmentedControlItemProps,
    Omit<React.HTMLAttributes<HTMLLabelElement>, 'value'> {}

const SegmentedControlItem = React.forwardRef<
  HTMLLabelElement,
  SegmentedControlItemProps
>((props, ref) => {
  const { value, disabled, children, ...restProps } = props;
  const api = useSegmentedControlContext();

  return (
    <SegmentedControlItemContext.Provider value={{ value, disabled }}>
      <label
        ref={ref}
        {...api.getItemProps({ value, disabled })}
        {...restProps}
      >
        {children}
      </label>
    </SegmentedControlItemContext.Provider>
  );
});
SegmentedControlItem.displayName = 'SegmentedControlItem';

interface SegmentedControlItemHiddenInputProps
  extends React.HTMLAttributes<HTMLInputElement> {}

const SegmentedControlItemHiddenInput = React.forwardRef<
  HTMLInputElement,
  SegmentedControlItemHiddenInputProps
>((props, ref) => {
  const { children, ...restProps } = props;
  const api = useSegmentedControlContext();
  const { value, disabled } = useSegmentedControlItemContext();

  return (
    <input
      ref={ref}
      {...api.getItemHiddenInputProps({ value, disabled })}
      {...restProps}
    />
  );
});
SegmentedControlItemHiddenInput.displayName = 'SegmentedControlItemHiddenInput';

interface SegmentedControlIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const SegmentedControlIndicator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  const api = useSegmentedControlContext();
  return <div ref={ref} {...api.getIndicatorProps()} {...props} />;
});
SegmentedControlIndicator.displayName = 'SegmentedControlIndicator';

export {
  SegmentedControlRoot,
  SegmentedControlItem,
  SegmentedControlItemHiddenInput,
  SegmentedControlIndicator,
};
export type {
  SegmentedControlRootProps,
  SegmentedControlItemProps,
  SegmentedControlItemHiddenInputProps,
  SegmentedControlIndicatorProps,
};
