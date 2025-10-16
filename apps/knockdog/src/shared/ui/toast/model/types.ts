import type React from 'react';
import type { ToastStore } from './store';

export type ToastPosition = 'top' | 'bottom' | 'bottom-above-nav';

export type ToastItem = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  duration: number;
  className?: string;
  variant?: 'rounded' | 'square';
  open: boolean;
};

export type Store = ToastStore;

export type ToastOptions = {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  duration?: number;
  className?: string;
  variant?: 'rounded' | 'square';
  position?: ToastPosition;
  viewportClassName?: string;
};

export type ToastDefaults = Omit<ToastOptions, 'id' | 'position' | 'viewportClassName'>;
