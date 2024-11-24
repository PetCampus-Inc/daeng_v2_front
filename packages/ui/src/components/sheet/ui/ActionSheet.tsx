import { Button } from '../../button';
import type { BaseSheetProps } from '../types';
import SheetLayout from './SheetLayout';

interface ActionsSheetProps extends BaseSheetProps {
  actionText?: string;
  onAction?: () => void;
}

const ActionSheet = ({
  actionText = '닫기',
  onAction,
  ...restProps
}: ActionsSheetProps) => {
  const handleActionClick = () => {
    if (onAction) {
      onAction();
    } else {
      restProps.onOpenChange?.(false);
    }
  };

  return (
    <SheetLayout
      {...restProps}
      footer={
        <Button className='grow' onClick={handleActionClick}>
          {actionText}
        </Button>
      }
    />
  );
};

export { ActionSheet };
