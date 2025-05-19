import { ComponentProps } from 'react';

function MenuButton({ children = '⋮', ...props }: ComponentProps<'button'>) {
  return (
    <button className='size-6' {...props}>
      {children}
    </button>
  );
}

export default MenuButton;
