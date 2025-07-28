import { elementProps } from '@daeng-design/utils';
import { useProgress, type UseProgressProps } from './use-progress';
import { useState } from 'react';

export type StepState = 'completed' | 'current' | 'upcoming';

export interface UseProgressBarProps extends UseProgressProps {
  totalSteps: number;
  currentStep?: number; // controlled
  defaultStep?: number; // uncontrolled
  onStepChange?: (step: number) => void;
}

export type UseProgressBarReturn = ReturnType<typeof useProgressBar> & {
  steps: {
    state: StepState;
    step: number;
    stepProps: ReturnType<typeof elementProps>;
  }[];
  setStep: (step: number) => void;
};

export function useProgressBar(props: UseProgressBarProps) {
  const {
    totalSteps,
    currentStep: controlledStep,
    defaultStep = 1,
    onStepChange,
    ...core
  } = props;

  const [uncontrolledStep, setUncontrolledStep] = useState(defaultStep);
  const isControlled = controlledStep !== undefined;
  const step = isControlled ? controlledStep : uncontrolledStep;

  const setStep = (newStep: number) => {
    if (!isControlled) {
      setUncontrolledStep(newStep);
    }
    onStepChange?.(newStep);
  };

  const progress = useProgress(core);

  const steps = Array.from({ length: totalSteps }, (_, index) => {
    const stepNumber = index + 1;
    let state: StepState = 'upcoming';
    if (stepNumber < progress.value!) state = 'completed';
    else if (stepNumber === Math.ceil(progress.value!)) state = 'current';

    let width = '0%';
    if (state === 'completed') width = '100%';
    else if (state === 'current')
      width = `${(progress.value! % 1) * 100 || 100}%`;

    return {
      state,
      step: stepNumber,
      width,
      stepProps: elementProps({
        ...progress.stateProps,
        'aria-current': state === 'current' ? 'step' : undefined,
        'aria-label': `Step ${stepNumber}`,
        'aria-hidden': true,
      }),
    };
  });

  const rootProps = elementProps({
    ...progress.progressProps,
  });

  const trackProps = elementProps({
    ...progress.stateProps,
  });

  return {
    ...progress,
    rootProps,
    trackProps,
    steps,
    setStep,
  };
}
