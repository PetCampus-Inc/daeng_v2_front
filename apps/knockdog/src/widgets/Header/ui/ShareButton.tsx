import { ComponentProps } from 'react';

type ShareButtonProps = ComponentProps<'button'> & {
  children?: string;
};

function ShareButton({ children = '공유', ...props }: ShareButtonProps) {
  return (
    <button className='size-6' {...props}>
      {children}
    </button>
  );
}

export default ShareButton;
