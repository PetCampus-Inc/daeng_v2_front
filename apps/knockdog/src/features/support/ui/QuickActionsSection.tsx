import { ActionButton } from '@knockdog/ui';
import { useOpenExternalLink } from '@shared/lib/bridge';
import { EXTERNAL_LINKS } from '@shared/constants';

interface QuickActionsSectionProps {
  onContactClick?: () => void;
  onSuggestionClick?: () => void;
  onChatRoomClick?: () => void;
}

function QuickActionsSection({ onChatRoomClick }: QuickActionsSectionProps) {
  const openExternalLink = useOpenExternalLink();

  const handleContactClick = () => {
    openExternalLink(EXTERNAL_LINKS.CONTACT);
  };

  const handleSuggestionClick = () => {
    openExternalLink(EXTERNAL_LINKS.SUGGESTION);
  };

  const handleChatRoomClick = () => {
    openExternalLink(EXTERNAL_LINKS.CHAT_ROOM);
  };

  return (
    <div className='flex flex-col gap-y-5 px-4 py-5'>
      <div className='flex items-center justify-between gap-x-2'>
        <ActionButton variant='secondaryLine' onClick={handleContactClick}>
          1:1 문의하기
        </ActionButton>
        <ActionButton variant='secondaryLine' onClick={handleSuggestionClick}>
          아이디어 제안하기
        </ActionButton>
      </div>
      <ActionButton variant='tertiaryFill' onClick={handleChatRoomClick}>
        똑독 유저 채팅방
      </ActionButton>
    </div>
  );
}

export { QuickActionsSection };
