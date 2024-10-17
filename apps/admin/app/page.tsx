'use client';

import loadingSpinnerDark from '@repo/ui/assets/lotties/loading_spinner_dark.json';
import { Button } from '@repo/ui/components/ui/button';
import { useState } from 'react';
import Lottie from 'react-lottie';

export default function Home() {
  const [state, setState] = useState('TEST');

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingSpinnerDark,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return (
    <div>
      <Button onClick={() => setState('TEST2')}>{state}</Button>
      <Lottie options={defaultOptions} width={80} />
    </div>
  );
}
