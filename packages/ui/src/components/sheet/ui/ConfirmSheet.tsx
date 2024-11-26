import { SheetClose } from './Sheet';
import { Button } from '../../button';

import type { BaseSheetProps } from '../types';
import SheetLayout from './SheetLayout';

interface ConfirmSheetProps extends BaseSheetProps {
  closeText?: string;
  confirmText?: string;
  onClose?: () => void;
  onConfirm?: () => void;
}
const ConfirmSheet = ({
  closeText = '닫기',
  confirmText = '확인',
  onClose,
  onConfirm,
  ...restProps
}: ConfirmSheetProps) => {
  return (
    <SheetLayout
      {...restProps}
      footer={
        <div className='flex gap-2'>
          <SheetClose asChild>
            <Button className='grow' colorScheme='default' onClick={onClose}>
              {closeText}
            </Button>
          </SheetClose>
          <Button className='grow' onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      }
    ></SheetLayout>
  );
};

export { ConfirmSheet };
