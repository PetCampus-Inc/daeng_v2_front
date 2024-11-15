import { cn } from '@knockdog/ui/lib';
import { forwardRef, TextareaHTMLAttributes } from 'react';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  value?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, value, disabled, rows, cols, ...restProps }, ref) => {
    return (
      <div
        className={cn(
          'border-gray3 disabled:border-gray4 focus-within:border-brown2 flex items-center rounded-md border p-2 transition-colors ease-in-out',
          className
        )}
      >
        <textarea
          ref={ref}
          value={value}
          rows={rows}
          cols={cols}
          disabled={disabled}
          autoComplete='off'
          className='focus:text-primary typo-body-16 text-gray1 disabled:text-gray3 placeholder:text-gray3 flex-1 resize-none bg-transparent outline-none'
          {...restProps}
        />
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
