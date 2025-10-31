// 기본 설정 관리
import type { ToastDefaults } from '../model/types';

let defaults: ToastDefaults = {
  title: undefined,
  description: undefined,
  duration: 2000,
  className: '',
  shape: 'rounded',
  type: 'default',
};

export function getDefaults(): ToastDefaults {
  return defaults;
}

export function setDefaults(next: Partial<ToastDefaults>): void {
  defaults = { ...defaults, ...next };
}
