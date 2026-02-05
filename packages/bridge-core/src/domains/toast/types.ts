type ToastShape = 'rounded' | 'square';
type ToastPosition = 'top' | 'bottom' | 'bottom-above-nav';
type ToastType = 'default' | 'success';

type ToastShowParams = {
  id?: string;
  title?: string;
  description?: string;
  duration?: number; // ms
  position?: ToastPosition;
  shape?: ToastShape;
  type?: ToastType;
};
type ToastDismissParams = { id?: string };
type ToastClearParams = {};

export type { ToastShowParams, ToastDismissParams, ToastClearParams, ToastShape, ToastPosition, ToastType };
