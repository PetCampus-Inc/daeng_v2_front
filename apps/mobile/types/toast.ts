export type ToastShape = 'rounded' | 'square';
export type ToastPosition = 'bottom' | 'bottom-above-nav' | 'top';
export type ToastType = 'default' | 'success';

export type ToastOptions = {
  id?: string;
  title?: string;
  description?: string;
  duration?: number; // ms
  className?: string | undefined; // 웹 호환용 (RN에서는 무시)
  variant?: never; // 웹 호환: 존재는 하지만 사용 안 함
  position?: ToastPosition; // 채널 선택용
  viewportClassName?: string | undefined; // 웹 호환용 (RN에서는 무시)
  shape?: ToastShape; // 모양만 분기
  type?: ToastType; // 'default' | 'success' (아이콘 표시)
  iconName?: string | undefined; // 선택: 아이콘 시스템 연동 시 사용
  onOpen?: () => void;
  onClose?: () => void;
};
