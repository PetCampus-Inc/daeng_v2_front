import type React from 'react';
import type { ToastStore } from './store';

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
  viewportClassName?: string;
};

export type ToastDefaults = Omit<ToastOptions, 'id' | 'viewportClassName'>;
