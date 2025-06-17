import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { ariaAttr, dataAttr, elementProps } from '@daeng-design/utils';
import {
  useId,
  useState,
  type InputHTMLAttributes,
  type HTMLAttributes,
  type LabelHTMLAttributes,
} from 'react';
import * as dom from './dom';

interface UseTextFieldStateProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

function useTextFieldState(props: UseTextFieldStateProps) {
  const [value, setValue] = useControllableState({
    prop: props.value,
    onChange: props.onValueChange,
    defaultProp: props.defaultValue ?? '',
  });
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  return {
    value,
    setValue,
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

interface UseTextFieldProps extends UseTextFieldStateProps {
  disabled?: boolean;
  invalid?: boolean;
  valid?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
}

type UseTextFieldReturn = ReturnType<typeof useTextField>;

function useTextField(props: UseTextFieldProps) {
  const {
    value: propValue,
    defaultValue,
    onValueChange,
    disabled = false,
    invalid = false,
    valid = false,
    readOnly = false,
    required = false,
    name,
  } = props;
  const {
    value,
    setValue,
    isHovered,
    setIsHovered,
    isActive,
    setIsActive,
    isFocused,
    setIsFocused,
    isFocusVisible,
    setIsFocusVisible,
  } = useTextFieldState({
    value: propValue,
    defaultValue,
    onValueChange,
  });

  const id = useId();

  const isUncontrolled = propValue === undefined;

  return {
    getStateProps() {
      return {
        'data-hover': dataAttr(isHovered),
        'data-active': dataAttr(isActive),
        'data-focus': dataAttr(isFocused),
        'data-focus-visible': dataAttr(isFocusVisible),
        'data-readonly': dataAttr(readOnly),
        'data-disabled': dataAttr(disabled),
        'data-invalid': dataAttr(invalid),
        'data-valid': dataAttr(valid),
        'aria-invalid': ariaAttr(invalid),
        'aria-required': ariaAttr(required),
        'aria-readonly': ariaAttr(readOnly),
        'aria-disabled': ariaAttr(disabled),
      };
    },

    getRootProps() {
      return elementProps<HTMLAttributes<HTMLDivElement>>({
        'data-disabled': dataAttr(disabled),
        'data-invalid': dataAttr(invalid),
        'data-valid': dataAttr(valid),
        'data-readonly': dataAttr(readOnly),

        onPointerMove() {
          setIsHovered(true);
        },
        onPointerDown() {
          setIsActive(true);
        },
        onPointerUp() {
          setIsActive(false);
        },
        onPointerLeave() {
          setIsHovered(false);
          setIsActive(false);
        },
      });
    },

    getLabelProps() {
      return elementProps<LabelHTMLAttributes<HTMLLabelElement>>({
        id: dom.getLabelId(id),
        htmlFor: dom.getInputId(id),
        'aria-required': ariaAttr(required),
        'data-disabled': dataAttr(disabled),
        'data-invalid': dataAttr(invalid),
        'data-valid': dataAttr(valid),
        'data-readonly': dataAttr(readOnly),
      });
    },

    getInputProps() {
      return elementProps<InputHTMLAttributes<HTMLInputElement>>({
        ...(isUncontrolled && defaultValue && { defaultValue }),
        ...(!isUncontrolled && { value }),
        id: dom.getInputId(id),
        name: name || id,
        required,
        disabled,
        readOnly,
        'data-hover': dataAttr(isHovered),
        'data-active': dataAttr(isActive),
        'data-focus': dataAttr(isFocused),
        'data-focus-visible': dataAttr(isFocusVisible),
        'data-readonly': dataAttr(readOnly),
        'data-disabled': dataAttr(disabled),
        'data-invalid': dataAttr(invalid),
        'data-valid': dataAttr(valid),
        'aria-invalid': ariaAttr(invalid),
        'aria-required': ariaAttr(required),
        'aria-readonly': ariaAttr(readOnly),
        'aria-disabled': ariaAttr(disabled),
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
          setIsFocusVisible(event.target.matches(':focus-visible'));
          setValue(event.target.value);
        },
        onBlur() {
          setIsFocused(false);
          setIsFocusVisible(false);
        },
        onFocus(event: React.FocusEvent<HTMLInputElement>) {
          setIsFocused(true);
          setIsFocusVisible(event.target.matches(':focus-visible'));
        },
      });
    },

    getDescriptionProps() {
      return elementProps<HTMLAttributes<HTMLSpanElement>>({
        id: dom.getDescriptionId(id),
        ...(invalid && { style: { display: 'none' } }),
      });
    },

    getMessageProps() {
      return elementProps<HTMLAttributes<HTMLSpanElement>>({
        id: dom.getMessageId(id),
        'data-disabled': dataAttr(disabled),
        'data-invalid': dataAttr(invalid),
        'data-valid': dataAttr(valid),
        'aria-live': invalid ? 'polite' : undefined,
      });
    },
  };
}

export { useTextField, type UseTextFieldProps, type UseTextFieldReturn };
