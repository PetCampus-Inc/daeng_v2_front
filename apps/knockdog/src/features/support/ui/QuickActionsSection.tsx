import { ActionButton } from '@knockdog/ui';

interface QuickActionsSectionProps {
  onContactClick?: () => void;
  onSuggestionClick?: () => void;
  onChatRoomClick?: () => void;
}

function QuickActionsSection({ onContactClick, onSuggestionClick, onChatRoomClick }: QuickActionsSectionProps) {
  return (
    <div className='flex flex-col gap-y-5 px-4 py-5'>
      <div className='flex items-center justify-between gap-x-2'>
        <ActionButton variant='secondaryLine' onClick={onContactClick}>
          1:1 문의하기
        </ActionButton>
        <ActionButton variant='secondaryLine' onClick={onSuggestionClick}>
          아이디어 제안하기
        </ActionButton>
      </div>
      <ActionButton variant='tertiaryFill' onClick={onChatRoomClick}>
        똑독 유저 채팅방
      </ActionButton>
    </div>
  );
}

export { QuickActionsSection };

