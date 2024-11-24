import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from './AlertDialog';
import type { BaseDialogProps } from '../types';

interface ActionDialogProps extends BaseDialogProps {
  actionText?: string;
  onAction?: () => void;
}

const ActionDialog = ({
  open,
  title,
  description,
  actionText = '확인',
  children,
  onAction,
  onOpenChange,
  ...restProps
}: ActionDialogProps) => {
  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      onOpenChange?.(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange} {...restProps}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
          <AlertDialogDescription asChild>
            {children || <span> {description}</span>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className='grow' onClick={handleAction}>
            {actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export { ActionDialog };
