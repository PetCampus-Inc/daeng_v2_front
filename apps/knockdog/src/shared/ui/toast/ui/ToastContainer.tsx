'use client';

import { useEffect } from 'react';
import { useStore } from 'zustand';
import { Toast, ToastProvider } from '@knockdog/ui';
import type { Store } from '../model/types';

type ToastContainerProps = {
  store: Store;
  viewportClassName?: string;
};

const ANIMATION_DURATION = 300; // Radix Toast 애니메이션 시간

function ToastItem({
  id,
  title,
  description,
  duration,
  className,
  variant,
  open,
  onDismiss,
  onRemove,
}: {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  duration: number;
  className?: string;
  variant?: 'rounded' | 'square';
  open: boolean;
  onDismiss: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  useEffect(() => {
    if (!open) return;

    // duration 후 자동으로 dismiss
    const timer = setTimeout(() => {
      onDismiss(id);
      // 애니메이션 완료 후 제거
      setTimeout(() => onRemove(id), ANIMATION_DURATION);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, open, onDismiss, onRemove]);

  return (
    <Toast
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          // 수동으로 닫을 때
          onDismiss(id);
          setTimeout(() => onRemove(id), ANIMATION_DURATION);
        }
      }}
      duration={duration}
      title={title}
      description={description}
      className={className}
      variant={variant}
    />
  );
}

export function ToastContainer({ store, viewportClassName }: ToastContainerProps) {
  const items = useStore(store, (state) => state.items);
  const dismiss = useStore(store, (state) => state.dismiss);
  const remove = useStore(store, (state) => state.remove);

  return (
    <ToastProvider className={viewportClassName}>
      {items.map((item) => (
        <ToastItem key={item.id} {...item} onDismiss={dismiss} onRemove={remove} />
      ))}
    </ToastProvider>
  );
}
