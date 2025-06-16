'use client';

import { createContext } from 'react';
import { type ReactOverlayView } from '../lib';

export type OverlayMap = Map<string, ReactOverlayView>;

export const OverlayContext = createContext<OverlayMap>(new Map());
export const OverlayHandlersContext = createContext<{
  registerOverlay: (id: string, overlay: ReactOverlayView) => void;
  unregisterOverlay: (id: string) => void;
}>({
  registerOverlay: () => {},
  unregisterOverlay: () => {},
});
