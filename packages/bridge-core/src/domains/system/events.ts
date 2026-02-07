import type { ShareParams } from './types';

export interface SystemEventMap {
  'system.openExternalLink': { url: string };
  'system.openSystemSetting': undefined;
  'system.share': ShareParams;
}
