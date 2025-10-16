// Channel 관리 - DOM 조작과 채널 생성 책임
'use client';

import { createRoot } from 'react-dom/client';
import type { Store } from './types';
import { createStore } from './store';
import { ToastContainer } from '../ui/ToastContainer';

type Channel = {
  store: Store;
  root: ReturnType<typeof createRoot>;
};

const channels = new Map<string, Channel>();

export function ensureChannel(viewportClassName?: string): Channel {
  const key = viewportClassName || 'default';
  const existing = channels.get(key);

  if (existing) return existing;

  // DOM 노드 생성
  const container = document.createElement('div');
  document.body.appendChild(container);

  // Store와 Root 생성
  const store = createStore();
  const root = createRoot(container);

  // 렌더링 (viewportClassName은 ToastContainer -> ToastProvider로 전달)
  root.render(<ToastContainer store={store} viewportClassName={viewportClassName} />);

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
