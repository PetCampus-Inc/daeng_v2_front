import { useState } from 'react';
import { createSafeContext } from '@shared/lib';

interface MarkerStateContextValue {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

const [MarkerStateContext, useMarkerState] = createSafeContext<MarkerStateContextValue>('MarkerStateContext');

function MarkerStateContextImpl({ children }: { children: React.ReactNode }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return <MarkerStateContext value={{ selectedId, setSelectedId }}>{children}</MarkerStateContext>;
}

export { MarkerStateContextImpl as MarkerStateContext, useMarkerState };
