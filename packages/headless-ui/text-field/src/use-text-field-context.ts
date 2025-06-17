import { createContext, useContext } from 'react';
import type { UseTextFieldReturn } from './use-text-field';

const TextFieldContext = createContext<UseTextFieldReturn | null>(null);

function useTextFieldContext() {
  const context = useContext(TextFieldContext);
  if (!context) {
    throw new Error('useTextFieldContext must be used within TextField');
  }
  return context;
}

export { TextFieldContext, useTextFieldContext };
