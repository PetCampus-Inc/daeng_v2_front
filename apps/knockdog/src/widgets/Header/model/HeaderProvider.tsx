'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type HeaderVariant = 'solid' | 'transparent';

type HeaderContextType = {
  variant: HeaderVariant;
  className: string;
  setClassName: (c: string) => void;
  textColor: string;
  setTextColor: (c: string) => void;
  setVariant: (v: HeaderVariant) => void;
  title: string | ReactNode;
  setTitle: (t: string | ReactNode) => void;
};

const HeaderContext = createContext<HeaderContextType | null>(null);

export function useHeaderContext() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('HeaderProvider 내부에서만 사용할 수 있습니다.');
  }
  return context;
}

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [variant, setVariant] = useState<HeaderVariant>('solid');
  const [title, setTitle] = useState<string | ReactNode>('');
  const [textColor, setTextColor] = useState<string>('');
  const [className, setClassName] = useState<string>('');

  return (
    <HeaderContext.Provider
      value={{
        variant,
        setVariant,
        title,
        setTitle,
        textColor,
        setTextColor,
        className,
        setClassName,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
}
