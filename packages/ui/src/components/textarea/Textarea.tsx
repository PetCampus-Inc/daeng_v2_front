'use client';

import * as React from 'react';
import { Textarea as TextareaPrimitive } from '@daeng-design/react-textarea';
import { cn } from '@knockdog/ui/lib';
import { Slot } from '@radix-ui/react-slot';
import { cva, VariantProps } from 'class-variance-authority';

const textareaVariants = cva('', {
  variants: {
    variant: {
      default: 'bg-neutral-50',
      secondary: 'border-line-200 bg-fill-secondary-0 border',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface TextareaProps extends Omit<TextareaPrimitive.RootProps, 'prefix'>, VariantProps<typeof textareaVariants> {
  ref?: React.Ref<HTMLDivElement>;
  label?: React.ReactNode;
  indicator?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  successMessage?: React.ReactNode;
  asChild?: boolean;
}

function Textarea({ ref, ...props }: TextareaProps) {
  const {
    asChild,
    label,
    indicator,
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

  const Comp = asChild ? Slot : TextareaPrimitive.Root;

  return (
    <Comp ref={ref} className='flex w-full flex-col' {...restProps}>
      {renderHeader && (
        <div className='pb-x2 gap-x0_5 flex items-center'>
          <TextareaPrimitive.Label className='text-text-primary body2-bold'>{label}</TextareaPrimitive.Label>
          {restProps.required && <span className='text-text-accent body2-bold'>*</span>}
          <TextareaPrimitive.Indicator className='text-text-tertiary caption1-semibold'>
            {indicator}
          </TextareaPrimitive.Indicator>
        </div>
      )}
      <TextareaPrimitive.Field
        className={cn(
          'invalid:border-error data-[invalid]:border-error data-[valid]:border-success disabled:bg-fill-secondary-50 data-[disabled]:bg-fill-secondary-50 radius-r2 px-x4 py-x3 focus-within:border-line-600 transition-colors',
          textareaVariants({ variant }),
          className
        )}
      >
        {children}
      </TextareaPrimitive.Field>
      {renderFooter && (
        <div className='pt-x2'>
          {renderDescription && (
            <TextareaPrimitive.Description className='text-text-secondary body2-regular'>
              {description}
            </TextareaPrimitive.Description>
          )}
          {renderErrorMessage && (
            <TextareaPrimitive.Message className='text-error body2-regular'>{errorMessage}</TextareaPrimitive.Message>
          )}
          {renderSuccessMessage && (
            <TextareaPrimitive.Message className='text-success body2-regular'>
              {successMessage}
            </TextareaPrimitive.Message>
          )}
        </div>
      )}
    </Comp>
  );
}

interface TextareaInputProps extends TextareaPrimitive.TextareaProps {
  ref?: React.Ref<HTMLTextAreaElement>;
  asChild?: boolean;
  className?: string;
}

function TextareaInput(props: TextareaInputProps) {
  const { ref, asChild, className, ...restProps } = props;

  const Comp = asChild ? Slot : TextareaPrimitive.Textarea;
  return (
    <Comp
      ref={ref}
      className={cn(
        'placeholder:text-text-tertiary text-text-primary disabled:text-text-secondary data-[disabled]:text-text-secondary body1-regular caret-text-accent h-full w-full resize-none outline-none',
        // 커스텀 스크롤바 스타일
        '[&::-webkit-scrollbar-track]:bg-fill-secondary-200 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:p-0.5 [&::-webkit-scrollbar]:w-2',
        '[&::-webkit-scrollbar-thumb]:bg-fill-secondary-500 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400',
        className
      )}
      {...restProps}
    />
  );
}

export { Textarea, TextareaInput };
