import * as React from 'react';
import { useTextarea, type UseTextareaProps } from './use-textarea';
import {
  TextareaContext,
  useTextareaContext,
} from './use-textarea-context';

interface TextareaRootProps
  extends Omit<UseTextareaProps, 'spellCheck'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'value' | 'defaultValue' | 'spellCheck'> {
  ref?: React.Ref<HTMLDivElement>;
}

function TextareaRoot({ ref, ...props }: TextareaRootProps) {
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
    rows,
    cols,
    maxLength,
    minLength,
    placeholder,
    autoComplete,
    autoFocus,
    wrap,
    ...restProps
  } = props;
  const api = useTextarea({
    value,
    defaultValue,
    onValueChange,
    disabled,
    invalid,
    valid,
    required,
    readOnly,
    name,
    rows,
    cols,
    maxLength,
    minLength,
    placeholder,
    autoComplete,
    autoFocus,
    wrap,
  });

  return (
    <TextareaContext.Provider value={api}>
      <div ref={ref} {...api.getRootProps()} {...restProps} />
    </TextareaContext.Provider>
  );
}
TextareaRoot.displayName = 'TextareaRoot';

interface TextareaLabelProps extends React.HTMLAttributes<HTMLLabelElement> {
  ref?: React.Ref<HTMLLabelElement>;
}

interface TextareaIndicatorProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  ref?: React.Ref<HTMLSpanElement>;
}

function TextareaIndicator(props: TextareaIndicatorProps) {
  const { ref, ...restProps } = props;
  const api = useTextareaContext();
  return <span ref={ref} {...api.getStateProps()} {...restProps} />;
}
TextareaIndicator.displayName = 'TextareaIndicator';

interface TextareaFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
}
function TextareaField(props: TextareaFieldProps) {
  const { ref, ...restProps } = props;
  const api = useTextareaContext();
  return <div ref={ref} {...api.getStateProps()} {...restProps} />;
}
TextareaField.displayName = 'TextareaField';

function TextareaLabel(props: TextareaLabelProps) {
  const { ref, ...restProps } = props;
  const api = useTextareaContext();
  return <label ref={ref} {...api.getLabelProps()} {...restProps} />;
}
TextareaLabel.displayName = 'TextareaLabel';

interface TextareaTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: React.Ref<HTMLTextAreaElement>;
}

function TextareaTextarea(props: TextareaTextareaProps) {
  const { ref, ...restProps } = props;
  const api = useTextareaContext();
  return <textarea ref={ref} {...api.getTextareaProps()} {...restProps} />;
}
TextareaTextarea.displayName = 'TextareaTextarea';

interface TextareaDescriptionProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  ref?: React.Ref<HTMLSpanElement>;
}

function TextareaDescription(props: TextareaDescriptionProps) {
  const { ref, ...restProps } = props;
  const api = useTextareaContext();
  return <span ref={ref} {...api.getDescriptionProps()} {...restProps} />;
}
TextareaDescription.displayName = 'TextareaDescription';

interface TextareaMessageProps extends React.HTMLAttributes<HTMLSpanElement> {
  ref?: React.Ref<HTMLSpanElement>;
}

function TextareaMessage(props: TextareaMessageProps) {
  const { ref, ...restProps } = props;
  const api = useTextareaContext();
  return <span ref={ref} {...api.getMessageProps()} {...restProps} />;
}
TextareaMessage.displayName = 'TextareaMessage';

export {
  TextareaRoot,
  TextareaLabel,
  TextareaTextarea,
  TextareaDescription,
  TextareaMessage,
  TextareaField,
  TextareaIndicator,
  type TextareaRootProps,
  type TextareaLabelProps,
  type TextareaTextareaProps,
  type TextareaDescriptionProps,
  type TextareaMessageProps,
  type TextareaFieldProps,
  type TextareaIndicatorProps,
}; 