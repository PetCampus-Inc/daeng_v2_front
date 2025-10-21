'use client';

import { useEffect } from 'react';
import { useStore } from 'zustand';
import { Toast, ToastProvider } from '@knockdog/ui';
import type { Store } from '../model/types';
import type { ToastPosition, ToastShape, ToastType } from '@knockdog/bridge-core';
import { getPositionClassName } from '../lib/position-styles';

type ToastContainerProps = {
  store: Store;
  position?: ToastPosition;
  viewportClassName?: string;
};

const ANIMATION_DURATION = 300; // Radix Toast 애니메이션 시간

function ToastItem({
  id,
  title,
  description,
  duration,
  className,
  shape,
  type,
  open,
  onDismiss,
  onRemove,
}: {
  id: string;
  title?: string;
  description?: string;
  duration: number;
  className?: string;
  shape?: ToastShape;
  type?: ToastType;
  open: boolean;
  onDismiss: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const handleDismissWithRemove = (toastId: string) => {
    onDismiss(toastId);
    setTimeout(() => onRemove(toastId), ANIMATION_DURATION);
  };

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => handleDismissWithRemove(id), duration);

    return () => clearTimeout(timer);
  }, [id, duration, open, onDismiss, onRemove]);

  return (
    <Toast
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleDismissWithRemove(id);
      }}
      duration={duration}
      title={title}
      description={description}
      className={className}
      variant={shape}
      toastType={type}
    />
  );
}

export function ToastContainer({ store, position = 'bottom', viewportClassName }: ToastContainerProps) {
  const items = useStore(store, (state) => state.items);
  const dismiss = useStore(store, (state) => state.dismiss);
  const remove = useStore(store, (state) => state.remove);

  // position을 className으로 변환, viewportClassName이 있으면 그게 우선
  const positionClassName = getPositionClassName(position);
  const finalClassName = viewportClassName || positionClassName;

  return (
    <ToastProvider className={finalClassName}>
      {items.map((item) => (
        <ToastItem key={item.id} {...item} onDismiss={dismiss} onRemove={remove} />
      ))}
    </ToastProvider>
  );
}
