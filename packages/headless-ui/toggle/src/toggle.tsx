'use client';

import type * as React from 'react';
import { forwardRef } from 'react';
import { useToggle, type UseToggleProps } from './use-toggle';
import { ToggleProvider } from './use-toggle-context';

export interface ToggleRootProps extends UseToggleProps, React.HTMLAttributes<HTMLButtonElement> {}

export const ToggleRoot = forwardRef<HTMLButtonElement, ToggleRootProps>((props, ref) => {
  const { pressed, defaultPressed, onPressedChange, disabled, ...otherProps } = props;
  const api = useToggle({
    pressed,
    defaultPressed,
    onPressedChange,
    disabled,
  });
  return (
    <ToggleProvider value={api}>
      <button ref={ref} type='button' {...api.rootProps} {...otherProps} />
    </ToggleProvider>
  );
});
ToggleRoot.displayName = 'ToggleRoot';
