import { ComponentPropsWithoutRef } from 'react';
import type * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { ReactNode } from 'react';

export interface BaseDialogProps
  extends ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Root> {
  title?: string;
  description?: string;
  children?: ReactNode;
}
