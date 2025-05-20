import { ComponentProps } from 'react';

function CloseButton({ children = 'X', ...props }: ComponentProps<'button'>) {
  return (
    <button className='size-6' {...props}>
      {children}
    </button>
  );
}

export default CloseButton;
