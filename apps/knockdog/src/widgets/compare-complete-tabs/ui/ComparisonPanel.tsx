import { PropsWithChildren } from 'react';

function ComparisonPanel({ children }: PropsWithChildren) {
  return <div className='bg-fill-secondary-0 rounded-2xl py-10'>{children}</div>;
}

export { ComparisonPanel };
