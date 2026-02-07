import type { NavigationEventMap } from '../domains/navigation';
import type { ToastEventMap } from '../domains/toast';
import type { MediaEventMap } from '../domains/media';
import type { SystemEventMap } from '../domains/system';

export type BridgeEventMap =
  & NavigationEventMap
  & ToastEventMap
  & MediaEventMap
  & SystemEventMap;
