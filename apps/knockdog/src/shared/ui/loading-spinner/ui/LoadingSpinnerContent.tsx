'use client';

import Lottie from 'lottie-react';
import loadingBallAnimation from '../config/loading_ball.json';
import { LoadingSpinnerProps } from '../model/types';

function LoadingSpinnerContent({ width = 120, height = 90, fullscreen = false, className }: LoadingSpinnerProps) {
  return (
    <div
      role='status'
      aria-label='페이지 로딩 중'
      className={`flex items-center justify-center ${fullscreen ? 'h-full' : ''} ${className}`}
    >
      <Lottie
        animationData={loadingBallAnimation}
        loop
        autoplay
        aria-hidden='true'
        style={{
          width,
          height,
        }}
      />
    </div>
  );
}

export { LoadingSpinnerContent };
