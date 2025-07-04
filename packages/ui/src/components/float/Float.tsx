'use client';

import * as React from 'react';
import { $dimension } from '@daeng-design/design-token/vars';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@knockdog/ui/lib';

interface FloatProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;

  placement:
    | 'bottom-end'
    | 'bottom-start'
    | 'top-end'
    | 'top-start'
    | 'bottom-center'
    | 'top-center'
    | 'middle-center'
    | 'middle-end'
    | 'middle-start';

  /**
   * @default 0
   */
  offsetX?: 0 | (string & {});

  /**
   * @default 0
   */
  offsetY?: 0 | (string & {});

  zIndex?: number | (string & {});
}

export function handleDimension(
  dimension: string | 0 | undefined
): string | undefined {
  if (dimension == null) {
    return undefined;
  }

  if (typeof dimension === 'number') {
    return `${dimension}px`;
  }

  if (dimension === 'full') {
    return '100%';
  }

  if (dimension in $dimension) {
    return $dimension[dimension as keyof typeof $dimension];
  }

  return dimension;
}

function getPlacementStyle(
  placement: FloatProps['placement'],
  offsetX: 0 | (string & {}) | undefined,
  offsetY: 0 | (string & {}) | undefined
): React.CSSProperties {
  const offsetXValue = handleDimension(offsetX);
  const offsetYValue = handleDimension(offsetY);

  const centerLeft = offsetXValue ? `calc(50% + ${offsetXValue})` : '50%';
  const middleTop = offsetYValue ? `calc(50% + ${offsetYValue})` : '50%';

  const shiftLeft = 'translateX(-50%)';
  const shiftTop = 'translateY(-50%)';
  const shiftBoth = 'translate(-50%, -50%)';

  switch (placement) {
    case 'top-start':
      return {
        top: offsetYValue,
        left: offsetXValue,
      };
    case 'top-center':
      return {
        top: offsetYValue,
        left: centerLeft,
        transform: shiftLeft,
      };
    case 'top-end':
      return {
        top: offsetYValue,
        right: offsetXValue,
      };
    case 'middle-start':
      return {
        top: middleTop,
        left: offsetXValue,
        transform: shiftTop,
      };
    case 'middle-center':
      return {
        top: middleTop,
        left: centerLeft,
        transform: shiftBoth,
      };
    case 'middle-end':
      return {
        top: middleTop,
        right: offsetXValue,
        transform: shiftTop,
      };
    case 'bottom-start':
      return {
        bottom: offsetYValue,
        left: offsetXValue,
      };
    case 'bottom-center':
      return {
        bottom: offsetYValue,
        left: centerLeft,
        transform: shiftLeft,
      };
    case 'bottom-end':
      return {
        bottom: offsetYValue,
        right: offsetXValue,
      };
  }
}

export function Float(props: FloatProps) {
  const {
    asChild,
    placement,
    offsetX,
    offsetY,
    zIndex,
    className,
    style,
    ...restProps
  } = props;
  const ref = React.useRef<HTMLDivElement>(null);

  const placementStyle = getPlacementStyle(placement, offsetX, offsetY);

  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      ref={ref}
      style={{
        zIndex,
        ...placementStyle,
        ...style,
      }}
      className={cn('absolute', className)}
      {...restProps}
    />
  );
}
Float.displayName = 'Float';
