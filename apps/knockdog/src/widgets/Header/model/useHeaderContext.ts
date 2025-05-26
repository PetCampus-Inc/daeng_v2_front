import { createContext, useContext } from 'react';

export type HeaderVariant = 'solid' | 'transparent';

type HeaderContextType = {
  variant: HeaderVariant;
  className?: string;
};

const HeaderContext = createContext<HeaderContextType | null>(null);

export function useHeaderContext() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('Header 컴포넌트 내부에서 사용해야 합니다');
  }
  return context;
}

export { HeaderContext };
