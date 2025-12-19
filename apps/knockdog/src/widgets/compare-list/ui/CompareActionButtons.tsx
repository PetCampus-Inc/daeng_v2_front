import { ActionButton } from '@knockdog/ui';
import React from 'react';

interface CompareActionButtonsProps {
  disabled?: boolean;
  selectedCount: number;
  totalCount: number;
  onClick: () => void;
  onClose: () => void;
}

function CompareActionButtons({
  disabled = false,
  selectedCount,
  totalCount,
  onClick,
  onClose,
}: CompareActionButtonsProps) {
  return (
    <div className='flex gap-2 px-4 pt-2 pb-5'>
      <ActionButton variant='secondaryLine' size='large' className='flex-1' onClick={onClose}>
        닫기
      </ActionButton>
      <ActionButton
        variant='primaryFill'
        size='large'
        disabled={disabled}
        className='flex-4'
        onClick={onClick}
      >{`비교하기 ${selectedCount}/${totalCount}`}</ActionButton>
    </div>
  );
}

export { CompareActionButtons };
