'use client';

import { useState } from 'react';

function useCopyToClipboard() {
  const [isCopied, setIsCopied] = useState(false);
  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
  };

  const reset = () => {
    setIsCopied(false);
  };

  return { isCopied, copy, reset };
}

export { useCopyToClipboard };
