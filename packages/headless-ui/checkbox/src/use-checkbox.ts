import * as React from 'react';
import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { useState, useRef, useEffect, useId } from 'react';
import { elementProps, dataAttr, labelProps, inputProps } from '@daeng-design/utils';

export interface UseCheckboxStateProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  indeterminate?: boolean;
}

function useCheckboxState(props: UseCheckboxStateProps) {
  const isControlled = props.checked !== undefined;
  const [isChecked = false, setIsChecked] = useControllableState({
    prop: props.checked,
    defaultProp: props.defaultChecked ?? false,
    onChange: props.onCheckedChange,
  });

  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const initialCheckedRef = useRef(isChecked);

  useEffect(() => {
    const form = inputRef.current?.form;
    if(form && !isControlled) {
      const reset = () => setIsChecked(initialCheckedRef.current);
      form.addEventListener('reset', reset);
      return () => form.removeEventListener('reset', reset);
    }
  }, [setIsChecked])

  useEffect(() => {
    if(!inputRef.current) return;

    inputRef.current.indeterminate = props.indeterminate ?? false;
  }, [props.indeterminate])

  return {
    refs: { input: inputRef},
    isIndeterminate: props.indeterminate ?? false,
    isControlled,
    isChecked,
    setIsChecked,
    isHovered,
    setIsHovered,
    isActive,
    setIsActive,
    isFocused,
    setIsFocused,
    isFocusVisible,
    setIsFocusVisible,
  };
}


export interface UseCheckboxProps extends UseCheckboxStateProps {
  disabled ?: boolean;
  invalid?: boolean;
  required?: boolean;
  children?: React.ReactNode;
  name?: string;
  value?: string;
  form?: string;
}

export type UseCheckboxReturn = ReturnType<typeof useCheckbox>;

export function useCheckbox(props: UseCheckboxProps) {
  const {refs,isChecked, isIndeterminate, setIsChecked, isHovered, setIsHovered, isActive, setIsActive, isFocused, setIsFocused, isFocusVisible, setIsFocusVisible, isControlled, ...restStats} = useCheckboxState(props);

  const checkboxId = useId();
  const hasLabel = React.Children.toArray(props.children).some(
    child => typeof child === 'string' || (React.isValidElement(child) && (child.type as any)?.displayName !== 'CheckboxIndicator')
  );

  const stateProps = elementProps({
    "data-checked": dataAttr(isChecked),
    "data-indeterminate": dataAttr(isIndeterminate),
    "data-hover": dataAttr(isHovered),
    "data-active": dataAttr(isActive),
    "data-focus": dataAttr(isFocused),
    "data-focus-visible": dataAttr(isFocusVisible),
    "data-disabled": dataAttr(props.disabled),
    "data-invalid": dataAttr(props.invalid),
    "data-required": dataAttr(props.required),
  })


  return {
    indeterminate: isIndeterminate,
    checked: isChecked,
    setChecked: setIsChecked,
    focused: isFocused,
    setFocused: setIsFocused,
    focusVisible: isFocusVisible,
    setFocusVisible: setIsFocusVisible,
    checkboxId,
    hasLabel,

    refs,
    stateProps,
    rootProps : labelProps({
      ...stateProps,
      onPointerMove: () => {
        if(props.disabled) return;
        setIsHovered(true)
      },
      onPointerDown: () => {
        if(props.disabled) return;
        setIsActive(true)
      },
      onPointerUp: () => {
        if(props.disabled) return;
        setIsActive(false)
      },
      onPointerLeave: () => {
        if(props.disabled) return;
        setIsHovered(false);
        setIsActive(false);
      },
    }),
    controlProps: elementProps({
      ...stateProps,
      "aria-hidden": true,
    }),
    hiddenInputProps: inputProps({
      type: 'checkbox',
      checked: isControlled ? isChecked : undefined,
      defaultChecked: isControlled ? undefined : props.defaultChecked,
      disabled: props.disabled,
      required: props.required,
      name: props.name,
      value: props.value,
      form: props.form,
      'aria-invalid': props.invalid,
      'aria-checked': isIndeterminate ? 'mixed' : isChecked,
      style: {
        border: 0,
        clip: "rect(0 0 0 0)",
        height: "1px",
        margin: "-1px",
        overflow: "hidden",
        padding: 0,
        position: "absolute",
        whiteSpace: "nowrap",
        width: "1px",
      },
      ...stateProps,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(event.currentTarget.checked);
        setIsFocusVisible(event.target.matches(":focus-visible"));
      },
      onFocus: (event: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        setIsFocusVisible(event.target.matches(":focus-visible"));
      },
      onBlur: () => {
        setIsFocused(false);
        setIsFocusVisible(false);
      },
      onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
        if(event.key === ' ') {
          setIsActive(true);
        }
      },
      onKeyUp: (event: React.KeyboardEvent<HTMLInputElement>) => {
        if(event.key === ' ') {
          setIsActive(false);
        }
      },
    })
  }
}