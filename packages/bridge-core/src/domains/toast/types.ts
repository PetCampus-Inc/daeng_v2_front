type ToastShape = 'rounded' | 'square';
type ToastPosition = 'top' | 'bottom' | 'bottom-above-nav';
type ToastType = 'default' | 'success';

type ToastTitlePart = {
  text: string;
  /** true면 text-accent(#ff6e0c)로 렌더 */
  accent?: boolean;
};

type ToastShowParams = {
  id?: string;
  title?: string;
  /** title 내 accent 하이라이트. 있으면 native에서 parts로 렌더 */
  titleParts?: ToastTitlePart[];
  description?: string;
  duration?: number; // ms
  position?: ToastPosition;
  shape?: ToastShape;
  type?: ToastType;
};
type ToastDismissParams = { id?: string };
type ToastClearParams = {};

export type {
  ToastShowParams,
  ToastDismissParams,
  ToastClearParams,
  ToastShape,
  ToastPosition,
  ToastType,
  ToastTitlePart,
};
