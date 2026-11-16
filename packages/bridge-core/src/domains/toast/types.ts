type ToastShape = 'rounded' | 'square';
type ToastPosition = 'top' | 'bottom' | 'bottom-above-nav';
type ToastType = 'default' | 'success';
type ToastIcon = 'info';

type ToastTitlePart = {
  text: string;
  /** true면 text-accent(#ff6e0c)+굵게로 렌더 */
  accent?: boolean;
  /** true면 글자색은 그대로(흰색)이고 굵게(700)만 렌더. 구버전 앱은 이 값을 몰라 보통 굵기로 보임 */
  bold?: boolean;
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
  /** 네이티브 선행 아이콘 (웹 InfoLine 대응) */
  icon?: ToastIcon;
  /** true면 아이콘을 text-accent(#ff6e0c)로 렌더 */
  iconAccent?: boolean;
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
  ToastIcon,
};
