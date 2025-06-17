import type { HTMLAttributes } from 'react';

type Booleanish = boolean | 'true' | 'false';

export function dataAttr(guard: boolean | undefined) {
  return guard ? '' : undefined;
}

export function ariaAttr(guard: boolean | undefined): Booleanish | undefined {
  return guard ? 'true' : undefined;
}

type DataAttr = { [key in `data-${string}`]?: string | undefined };

export const elementProps = <T extends HTMLAttributes<any>>(
  props: T & DataAttr
): T => props;
