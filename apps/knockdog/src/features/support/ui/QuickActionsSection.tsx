import { ActionButton } from '@knockdog/ui';
import { useOpenExternalLink } from '@shared/lib/bridge';

interface QuickActionsSectionProps {
  onContactClick?: () => void;
  onSuggestionClick?: () => void;
  onChatRoomClick?: () => void;
}

const EXTERNAL_LINKS = {
  CONTACT: 'https://fifth-potato-175.notion.site/1-1-2ba6c15f67fb8080b956f7bea92a15d5?source=copy_link',
  SUGGESTION: 'https://fifth-potato-175.notion.site/2ba6c15f67fb80088ff1e9d1d0293ca5?source=copy_link',
  // CHAT_ROOM: 'https://fifth-potato-175.notion.site/2006c15f67fb803aadc1f2ec7dbb8892?source=copy_link',
};

function QuickActionsSection({ onChatRoomClick }: QuickActionsSectionProps) {
  const openExternalLink = useOpenExternalLink();

  const handleContactClick = () => {
    openExternalLink(EXTERNAL_LINKS.CONTACT);
  };

  const handleSuggestionClick = () => {
    openExternalLink(EXTERNAL_LINKS.SUGGESTION);
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
      <ActionButton variant='tertiaryFill' onClick={onChatRoomClick}>
        똑독 유저 채팅방
      </ActionButton>
    </div>
  );
}

export { QuickActionsSection };
