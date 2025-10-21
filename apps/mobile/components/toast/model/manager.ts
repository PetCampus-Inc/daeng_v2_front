import { createToastStore } from './store';
import type { ToastPosition } from '@/types/toast';

const channels = {
  top: createToastStore(),
  bottom: createToastStore(),
  bottomAboveNav: createToastStore(),
};

export function ensureChannel(
  position?: ToastPosition,
  _viewportClassName?: string | undefined // 웹 호환 (무시)
) {
  // viewportClassName은 RN에서 의미 없음. position만 사용.
  const key = position === 'top' ? 'top' : position === 'bottom-above-nav' ? 'bottomAboveNav' : 'bottom';
  return { store: channels[key] };
}

export function dismissFromAllChannels(id?: string) {
  channels.top.getState().dismiss(id);
  channels.bottom.getState().dismiss(id);
  channels.bottomAboveNav.getState().dismiss(id);
}

export function clearAllChannels() {
  channels.top.getState().clear();
  channels.bottom.getState().clear();
  channels.bottomAboveNav.getState().clear();
}

// 내부에서 Provider가 이 stores를 구독하여 각 Viewport를 렌더
export const __channelStores = channels;
