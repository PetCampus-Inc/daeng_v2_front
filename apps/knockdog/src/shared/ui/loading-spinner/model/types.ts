type LoadingSpinnerLayout = 'inline' | 'content' | 'screen';

interface LoadingSpinnerProps {
  /** inline: 부모 기준 중앙, content: 콘텐츠 영역(헤더/GNB 유지) 중앙, screen: 화면 전체 중앙 */
  layout?: LoadingSpinnerLayout;
  fullscreen?: boolean;
  className?: string;
}

interface DelayedLoadingSpinnerProps extends LoadingSpinnerProps {
  isLoading: boolean;
  delayMs?: number;
}

export type { LoadingSpinnerLayout, LoadingSpinnerProps, DelayedLoadingSpinnerProps };
