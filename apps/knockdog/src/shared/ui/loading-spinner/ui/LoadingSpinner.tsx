import dynamic from 'next/dynamic';
import { LoadingSpinnerProps } from '../model/types';

export const LoadingSpinner = dynamic<LoadingSpinnerProps>(
  () => import('./LoadingSpinnerContent').then((mod) => ({ default: mod.LoadingSpinnerContent })),
  {
    ssr: false,
  }
);
