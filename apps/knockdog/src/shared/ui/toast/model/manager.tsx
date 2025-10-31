// Channel 관리 - DOM 조작과 채널 생성 책임
'use client';

import { createRoot } from 'react-dom/client';
import type { Store, ToastPosition } from './types';
import { createStore } from './store';
import { ToastContainer } from '../ui/ToastContainer';

type Channel = {
  store: Store;
  root: ReturnType<typeof createRoot>;
};

const channels = new Map<string, Channel>();

export function ensureChannel(position?: ToastPosition, viewportClassName?: string): Channel {
  // position이 있으면 position으로 채널 키 생성, viewportClassName이 있으면 그것 우선, 둘 다 없으면 'default'
  const key = viewportClassName || position || 'default';
  const existing = channels.get(key);

  if (existing) return existing;

  // DOM 노드 생성
  const container = document.createElement('div');
  document.body.appendChild(container);

  // Store와 Root 생성
  const store = createStore();
  const root = createRoot(container);

  // 렌더링 (position과 viewportClassName을 ToastContainer -> ToastProvider로 전달)
  root.render(<ToastContainer store={store} position={position} viewportClassName={viewportClassName} />);

  const channel = { store, root };
  channels.set(key, channel);

  return channel;
}

export function dismissFromAllChannels(id: string): void {
  channels.forEach((channel) => {
    channel.store.getState().dismiss(id);
  });
}

export function clearAllChannels(): void {
  channels.forEach((channel) => {
    channel.store.getState().clear();
  });
}
