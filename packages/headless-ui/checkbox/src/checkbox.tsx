"use client";

import * as React from "react";
import { forwardRef } from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { useCheckbox, type UseCheckboxProps } from "./use-checkbox";
import { CheckboxProvider, useCheckboxContext } from "./use-checkbox-context";

export interface CheckboxRootProps
  extends UseCheckboxProps,
    React.LabelHTMLAttributes<HTMLLabelElement> {
  children?: React.ReactNode;
}

export const CheckboxRoot = forwardRef<HTMLLabelElement, CheckboxRootProps>(
  (props, ref) => {
    const {
      checked,
      defaultChecked,
      onCheckedChange,
      indeterminate,
      disabled,
      invalid,
      required,
      children,
      ...otherProps
    } = props;

    const api = useCheckbox({
      checked,
      defaultChecked,
      onCheckedChange,
      indeterminate,
      disabled,
      invalid,
      required,
      children,
    });

    return (
      <CheckboxProvider value={api}>
        <label 
          ref={ref} 
          {...api.rootProps} 
          {...otherProps}
          htmlFor={api.hasLabel ? api.checkboxId : undefined}
        >
          <input
            ref={composeRefs(api.refs.input)}
            id={api.checkboxId}
            {...api.hiddenInputProps}
          />
          {children}
        </label>
      </CheckboxProvider>
    );
  }
);
CheckboxRoot.displayName = "CheckboxRoot";

export interface CheckboxIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const CheckboxIndicator = forwardRef<HTMLDivElement, CheckboxIndicatorProps>(
  (props, ref) => {
    const { controlProps } = useCheckboxContext();
    return <div ref={ref} {...controlProps} {...props} />;
  }
);
CheckboxIndicator.displayName = "CheckboxIndicator";
