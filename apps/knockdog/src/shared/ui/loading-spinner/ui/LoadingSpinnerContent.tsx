'use client';

import Lottie from 'lottie-react';
import { cn } from '@knockdog/ui/lib';
import loadingBallAnimation from '../config/loading_ball.json';
import type { LoadingSpinnerLayout, LoadingSpinnerProps } from '../model/types';

const LOADING_SPINNER_SIZE = { width: 120, height: 90 };

const layoutWrapperClass: Record<LoadingSpinnerLayout, string> = {
  inline: 'flex items-center justify-center',
  content: 'flex min-h-0 flex-1 items-center justify-center',
  screen: 'flex h-dvh w-full items-center justify-center',
};

function LoadingSpinnerContent({
  layout = 'inline',
  fullscreen = false,
  className,
}: LoadingSpinnerProps) {
  const resolvedLayout: LoadingSpinnerLayout = fullscreen ? 'content' : layout;

  return (
    <div
      role='status'
      aria-label='로딩 중'
      className={cn(layoutWrapperClass[resolvedLayout], className)}
    >
      <Lottie
        animationData={loadingBallAnimation}
        loop
        autoplay
        aria-hidden='true'
        style={LOADING_SPINNER_SIZE}
      />
    </div>
  );
}

export { LoadingSpinnerContent };
