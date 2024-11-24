import { ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from './AlertDialog';
import type { BaseDialogProps } from '../types';

interface ConfirmDialogProps extends BaseDialogProps {
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
  children,
  onConfirm,
  onCancel,
  onOpenChange,
  ...restProps
}: ConfirmDialogProps) => {
  const handleOpenChange = (open: boolean) => {
    onOpenChange?.(open);
  };

  const handleConfirm = () => {
    onConfirm?.();
    handleOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    handleOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange} {...restProps}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
          <AlertDialogDescription>
            {children || <span> {description}</span>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className='grow' onClick={handleCancel}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction className='grow' onClick={handleConfirm}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export { ConfirmDialog };
