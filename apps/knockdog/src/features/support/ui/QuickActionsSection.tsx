import { ActionButton } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { useOpenExternalLink } from '@shared/lib/bridge';
import { EXTERNAL_LINKS } from '@shared/constants';

interface QuickActionsSectionProps {
  className?: string;
  contactUrl?: string;
  onContactClick?: () => void;
  onSuggestionClick?: () => void;
  onChatRoomClick?: () => void;
}

function QuickActionsSection({ className, contactUrl = EXTERNAL_LINKS.CONTACT, onChatRoomClick }: QuickActionsSectionProps) {
  const openExternalLink = useOpenExternalLink();

  const handleContactClick = () => {
    openExternalLink(contactUrl);
  };

  const handleSuggestionClick = () => {
    openExternalLink(EXTERNAL_LINKS.SUGGESTION);
  };

  const handleChatRoomClick = () => {
    openExternalLink(EXTERNAL_LINKS.CHAT_ROOM);
  };

  return (
    <div className={cn('flex flex-col gap-y-4 px-4 py-5', className)}>
      <div className='flex items-center justify-between gap-x-2'>
        <ActionButton size='large' variant='secondaryLine' onClick={handleContactClick}>
          1:1 문의하기
        </ActionButton>
        <ActionButton size='large' variant='secondaryLine' onClick={handleSuggestionClick}>
          아이디어 제안하기
        </ActionButton>
      </div>
      <ActionButton size='large' variant='tertiaryFill' onClick={handleChatRoomClick}>
        똑독 유저 채팅방
      </ActionButton>
    </div>
  );
}

export { QuickActionsSection };
