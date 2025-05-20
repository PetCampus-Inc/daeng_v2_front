import { ComponentProps } from 'react';

type BackButtonProps = ComponentProps<'button'> & {
  children?: string;
};

function BackButton({ children = '<', ...props }: BackButtonProps) {
  return (
    <button className='size-6' {...props}>
      {children}
    </button>
  );
}

export default BackButton;
