import { createContext, useContext } from 'react';
import type { UseTextareaReturn } from './use-textarea';

const TextareaContext = createContext<UseTextareaReturn | null>(null);

function useTextareaContext() {
  const context = useContext(TextareaContext);
  if (!context) {
    throw new Error('useTextareaContext must be used within Textarea');
  }
  return context;
}

export { TextareaContext, useTextareaContext };
