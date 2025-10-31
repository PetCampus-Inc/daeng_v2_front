import type { ToastOptions } from '@/types/toast';

type Defaults = Pick<ToastOptions, 'title' | 'description' | 'duration' | 'className' | 'shape' | 'position' | 'type'>;

let defaults: Partial<Defaults> = {
  duration: 2000,
  shape: 'rounded',
  position: 'bottom',
  type: 'default',
};

export function getDefaults(): Partial<Defaults> {
  return defaults;
}

export function setDefaults(next: Partial<Defaults>) {
  defaults = { ...defaults, ...next };
}
