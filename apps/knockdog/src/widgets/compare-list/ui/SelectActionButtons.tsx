import { ActionButton, Icon } from '@knockdog/ui';
import React from 'react';

interface SelectActionButtonsProps {
  isSelected: boolean;
  disabled?: boolean;
  onClick: () => void;
  onClose: () => void;
}

function SelectActionButtons({ isSelected, disabled, onClick, onClose }: SelectActionButtonsProps) {
  return (
    <div className='flex gap-2 px-4 pt-2 pb-5'>
      <ActionButton variant='secondaryLine' size='large' className='flex-1' onClick={onClose}>
        취소
      </ActionButton>

      {isSelected ? (
        <ActionButton variant='secondaryFill' size='large' className='flex-4' onClick={onClick}>
          <Icon icon='Minus' className='h-5 w-5' />
          <span>선택 해제</span>
        </ActionButton>
      ) : (
        <ActionButton variant='secondaryFill' size='large' className='flex-4' onClick={onClick} disabled={disabled}>
          <Icon icon='Plus' className='h-5 w-5' />
          <span>선택하기</span>
        </ActionButton>
      )}
    </div>
  );
}

export { SelectActionButtons };
