'use client';

import * as React from 'react';
import { TextField as TextFieldPrimitive } from '@daeng-design/react-text-field';
import { cn } from '@knockdog/ui/lib';
import { Slot } from '@radix-ui/react-slot';
import { cva, VariantProps } from 'class-variance-authority';

const textFieldVariants = cva('', {
  variants: {
    variant: {
      default: 'border-line-200 bg-fill-secondary-0 border',
      secondary: 'bg-neutral-50',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface TextFieldProps extends Omit<TextFieldPrimitive.RootProps, 'prefix'>, VariantProps<typeof textFieldVariants> {
  ref?: React.Ref<HTMLDivElement>;
  label?: React.ReactNode;
  indicator?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  successMessage?: React.ReactNode;
  asChild?: boolean;
}

function TextField({ ref, ...props }: TextFieldProps) {
  const {
    asChild,
    label,
    indicator,
    prefix,
    suffix,
    children,
    description,
    errorMessage,
    successMessage,
    className,
    variant,
    ...restProps
  } = props;

  const renderDescription = description && !restProps.invalid && !restProps.valid;
  const renderErrorMessage = errorMessage && restProps.invalid;
  const renderSuccessMessage = successMessage && restProps.valid;
  const renderFooter = renderDescription || renderErrorMessage || renderSuccessMessage;
  const renderHeader = label || indicator;

  const Comp = asChild ? Slot : TextFieldPrimitive.Root;

  return (
    <Comp ref={ref} className='flex w-full flex-col' {...restProps}>
      {renderHeader && (
        <div className='pb-x2 gap-x0_5 flex items-center'>
          <TextFieldPrimitive.Label className='text-text-primary body2-bold'>{label}</TextFieldPrimitive.Label>
          {restProps.required && <span className='text-text-accent body2-bold'>*</span>}
          <TextFieldPrimitive.Indicator className='text-text-tertiary caption1-semibold'>
            {indicator}
          </TextFieldPrimitive.Indicator>
        </div>
      )}
      <TextFieldPrimitive.Field
        className={cn(
          'invalid:border-error data-[invalid]:border-error data-[valid]:border-success disabled:bg-fill-secondary-50 data-[disabled]:bg-fill-secondary-50 radius-r2 px-x4 gap-x2 focus-within:border-line-600 flex items-center transition-colors',
          textFieldVariants({ variant }),
          className
        )}
      >
        {prefix}
        {children}

        <div className='body2-bold'>{suffix}</div>
      </TextFieldPrimitive.Field>
      {renderFooter && (
        <div className='pt-x2'>
          {renderDescription && (
            <TextFieldPrimitive.Description className='text-text-secondary body2-regular'>
              {description}
            </TextFieldPrimitive.Description>
          )}
          {renderErrorMessage && (
            <TextFieldPrimitive.Message className='text-error body2-regular'>{errorMessage}</TextFieldPrimitive.Message>
          )}
          {renderSuccessMessage && (
            <TextFieldPrimitive.Message className='text-success body2-regular'>
              {successMessage}
            </TextFieldPrimitive.Message>
          )}
        </div>
      )}
    </Comp>
  );
}

interface TextFieldInputProps extends TextFieldPrimitive.InputProps {
  ref?: React.Ref<HTMLInputElement>;
  asChild?: boolean;
}

function TextFieldInput(props: TextFieldInputProps) {
  const { ref, asChild, ...restProps } = props;

  const Comp = asChild ? Slot : TextFieldPrimitive.Input;
  return (
    <Comp
      ref={ref}
      className={cn(
        'placeholder:text-text-tertiary text-text-primary disabled:text-text-secondary data-[disabled]:text-text-secondary py-x3 body1-regular caret-text-accent h-full grow outline-none',
        props.className
      )}
      {...restProps}
    />
  );
}

export { TextField, TextFieldInput };
