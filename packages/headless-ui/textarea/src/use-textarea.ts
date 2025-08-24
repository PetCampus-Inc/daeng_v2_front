import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { ariaAttr, dataAttr, elementProps } from '@daeng-design/utils';
import { useId, useState, type TextareaHTMLAttributes, type HTMLAttributes, type LabelHTMLAttributes } from 'react';
import * as dom from './dom';

interface UseTextareaStateProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

function useTextareaState(props: UseTextareaStateProps) {
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

interface UseTextareaProps extends UseTextareaStateProps {
  disabled?: boolean;
  invalid?: boolean;
  valid?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  rows?: number;
  cols?: number;
  maxLength?: number;
  minLength?: number;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  spellCheck?: boolean;
  wrap?: 'soft' | 'hard';
}

type UseTextareaReturn = ReturnType<typeof useTextarea>;

function useTextarea(props: UseTextareaProps) {
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
    rows,
    cols,
    maxLength,
    minLength,
    placeholder,
    autoComplete,
    autoFocus,
    spellCheck,
    wrap,
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
  } = useTextareaState({
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
        htmlFor: dom.getTextareaId(id),
        'aria-required': ariaAttr(required),
        'data-disabled': dataAttr(disabled),
        'data-invalid': dataAttr(invalid),
        'data-valid': dataAttr(valid),
        'data-readonly': dataAttr(readOnly),
      });
    },

    getTextareaProps() {
      return elementProps<TextareaHTMLAttributes<HTMLTextAreaElement>>({
        ...(isUncontrolled && defaultValue && { defaultValue }),
        ...(!isUncontrolled && { value }),
        id: dom.getTextareaId(id),
        name: name || id,
        required,
        disabled,
        readOnly,
        rows,
        cols,
        maxLength,
        minLength,
        placeholder,
        autoComplete,
        autoFocus,
        spellCheck,
        wrap,
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
        onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => {
          setIsFocusVisible(event.target.matches(':focus-visible'));
          setValue(event.target.value);
        },
        onBlur() {
          setIsFocused(false);
          setIsFocusVisible(false);
        },
        onFocus(event: React.FocusEvent<HTMLTextAreaElement>) {
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

export { useTextarea, type UseTextareaProps, type UseTextareaReturn };
