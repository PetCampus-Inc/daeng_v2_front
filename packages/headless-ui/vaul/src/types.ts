export type DrawerDirection = 'top' | 'bottom' | 'left' | 'right';

export type SnapContext = {
  viewportHeight: number;
  measuredDrawerHeight: number;
};

export type ContentSnap = {
  type: 'content';
  min: number | string;
  max?: number | string;
};

export type SnapPoint = number | string | ContentSnap | ((ctx: SnapContext) => number);

export type AnyFunction = (...args: any) => any;
