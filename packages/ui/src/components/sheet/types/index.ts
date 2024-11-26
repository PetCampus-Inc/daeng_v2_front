import type { ReactNode } from 'react';
import type * as SheetPrimitive from '@radix-ui/react-dialog';
import type { ComponentPropsWithoutRef } from 'react';

export type SheetSide = 'top' | 'bottom' | 'left' | 'right';

export type BaseSheetPrimitiveProps = ComponentPropsWithoutRef<
  typeof SheetPrimitive.Root
>;

export interface BaseSheetProps extends BaseSheetPrimitiveProps {
  title?: string;
  description?: string;
  side?: SheetSide;
  showCloseButton?: boolean;
  children?: ReactNode;
  contentClassName?: string;
}
