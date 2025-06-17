import * as React from 'react';
import { useTextField, type UseTextFieldProps } from './use-text-field';
import {
  TextFieldContext,
  useTextFieldContext,
} from './use-text-field-context';

interface TextFieldRootProps
  extends UseTextFieldProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'value' | 'defaultValue'> {
  ref?: React.Ref<HTMLDivElement>;
}

function TextFieldRoot({ ref, ...props }: TextFieldRootProps) {
  const {
    value,
    defaultValue,
    onValueChange,
    disabled,
    invalid,
    valid,
    required,
    readOnly,
    name,
    ...restProps
  } = props;
  const api = useTextField({
    value,
    defaultValue,
    onValueChange,
    disabled,
    invalid,
    valid,
    required,
    readOnly,
    name,
  });

  return (
    <TextFieldContext.Provider value={api}>
      <div ref={ref} {...api.getRootProps()} {...restProps} />
    </TextFieldContext.Provider>
  );
}
TextFieldRoot.displayName = 'TextFieldRoot';

interface TextFieldLabelProps extends React.HTMLAttributes<HTMLLabelElement> {
  ref?: React.Ref<HTMLLabelElement>;
}

interface TextFieldIndicatorProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  ref?: React.Ref<HTMLSpanElement>;
}

function TextFieldIndicator(props: TextFieldIndicatorProps) {
  const { ref, ...restProps } = props;
  const api = useTextFieldContext();
  return <span ref={ref} {...api.getStateProps()} {...restProps} />;
}
TextFieldIndicator.displayName = 'TextFieldIndicator';

interface TextFieldFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
}
function TextFieldField(props: TextFieldFieldProps) {
  const { ref, ...restProps } = props;
  const api = useTextFieldContext();
  return <div ref={ref} {...api.getStateProps()} {...restProps} />;
}
TextFieldField.displayName = 'TextFieldField';

function TextFieldLabel(props: TextFieldLabelProps) {
  const { ref, ...restProps } = props;
  const api = useTextFieldContext();
  return <label ref={ref} {...api.getLabelProps()} {...restProps} />;
}
TextFieldLabel.displayName = 'TextFieldLabel';

interface TextFieldInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<HTMLInputElement>;
}

function TextFieldInput(props: TextFieldInputProps) {
  const { ref, ...restProps } = props;
  const api = useTextFieldContext();
  return <input ref={ref} {...api.getInputProps()} {...restProps} />;
}
TextFieldInput.displayName = 'TextFieldInput';

interface TextFieldDescriptionProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  ref?: React.Ref<HTMLSpanElement>;
}

function TextFieldDescription(props: TextFieldDescriptionProps) {
  const { ref, ...restProps } = props;
  const api = useTextFieldContext();
  return <span ref={ref} {...api.getDescriptionProps()} {...restProps} />;
}
TextFieldDescription.displayName = 'TextFieldDescription';

interface TextFieldMessageProps extends React.HTMLAttributes<HTMLSpanElement> {
  ref?: React.Ref<HTMLSpanElement>;
}

function TextFieldMessage(props: TextFieldMessageProps) {
  const { ref, ...restProps } = props;
  const api = useTextFieldContext();
  return <span ref={ref} {...api.getMessageProps()} {...restProps} />;
}
TextFieldMessage.displayName = 'TextFieldMessage';

export {
  TextFieldRoot,
  TextFieldLabel,
  TextFieldInput,
  TextFieldDescription,
  TextFieldMessage,
  TextFieldField,
  TextFieldIndicator,
  type TextFieldRootProps,
  type TextFieldLabelProps,
  type TextFieldInputProps,
  type TextFieldDescriptionProps,
  type TextFieldMessageProps,
  type TextFieldFieldProps,
  type TextFieldIndicatorProps,
};
