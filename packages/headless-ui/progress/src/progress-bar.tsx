import { forwardRef } from 'react';
import { ProgressBarProvider, useProgressBarContext } from './use-progress-bar-context';
import { useProgressBar, type UseProgressBarProps } from './use-progress-bar';

export interface ProgressBarRootProps extends UseProgressBarProps, React.HTMLAttributes<HTMLDivElement> {}

export const ProgressBarRoot = forwardRef<HTMLDivElement, ProgressBarRootProps>((props, ref) => {
  const { value, maxValue, minValue, totalSteps, currentStep, defaultStep, onStepChange, ...otherProps } = props;
  const api = useProgressBar({
    value,
    maxValue,
    minValue,
    totalSteps,
    currentStep,
    defaultStep,
    onStepChange,
  });
  return (
    <ProgressBarProvider value={api}>
      <div ref={ref} {...otherProps} {...api.rootProps} />
    </ProgressBarProvider>
  );
});
ProgressBarRoot.displayName = 'ProgressBarRoot';

export interface ProgressBarTrackProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ProgressBarTrack = forwardRef<HTMLDivElement, ProgressBarTrackProps>((props, ref) => {
  const { style, ...otherProps } = props;
  const { trackProps } = useProgressBarContext();

  return <div ref={ref} {...otherProps} {...trackProps} style={{ ...style, ...trackProps.style }} />;
});
ProgressBarTrack.displayName = 'ProgressBarTrack';

export interface ProgressBarRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  stepIndex?: number;
}

export const ProgressBarRange = forwardRef<HTMLDivElement, ProgressBarRangeProps>((props, ref) => {
  const { style, stepIndex, ...otherProps } = props;
  const { steps } = useProgressBarContext();

  const stepData = stepIndex !== undefined ? steps[stepIndex] : null;

  return <div ref={ref} {...otherProps} {...stepData?.stepProps} style={{ ...style, width: stepData?.width }} />;
});
ProgressBarRange.displayName = 'ProgressBarRange';
