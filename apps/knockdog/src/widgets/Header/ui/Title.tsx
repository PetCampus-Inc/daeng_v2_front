import { ComponentProps } from 'react';

function Title({
  children,
  position = 'center',
  ...props
}: ComponentProps<'span'> & { position?: 'left' | 'center' | 'right' }) {
  return (
    <span
      className={`text-[16px] font-bold ${
        position === 'center'
          ? 'mx-auto'
          : position === 'right'
            ? 'ml-auto'
            : ''
      }`}
      {...props}
    >
      {children}
    </span>
  );
}

export default Title;
