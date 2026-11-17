import { ActionButton } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { useOpenExternalLink, useStackNavigation } from '@shared/lib/bridge';
import { EXTERNAL_LINKS } from '@shared/constants';
import { route } from '@shared/constants/route';

export interface QuickActionsSectionProps {
  variant?: 'guardian' | 'owner';
  className?: string;
  onContactClick?: () => void;
  onSuggestionClick?: () => void;
  onChatRoomClick?: () => void;
}

const QuickActionsSection = ({ variant = 'guardian', className, onChatRoomClick }: QuickActionsSectionProps) => {
  const openExternalLink = useOpenExternalLink();
  const { push } = useStackNavigation();

  const handleContactClick = () => {
    push({ pathname: route.mypage.inquiry.root });
  };

  const handleSuggestionClick = () => {
    push({ pathname: route.mypage.ideaSuggestion.root });
  };

  const handleChatRoomClick = () => {
    openExternalLink(EXTERNAL_LINKS.CHAT_ROOM);
  };

  return (
    <div className={cn('flex flex-col gap-y-4 px-4 py-5', className)}>
      <div className='flex items-center justify-between gap-x-2'>
        <ActionButton
          size='large'
          variant='secondaryLine'
          className={cn(variant === 'owner' && 'border-line-200 text-primitive-neutral-500 font-bold')}
          onClick={handleContactClick}
        >
          1:1 문의하기
        </ActionButton>
        <ActionButton
          size='large'
          variant='secondaryLine'
          className={cn(variant === 'owner' && 'border-line-200 text-primitive-neutral-500 font-bold')}
          onClick={handleSuggestionClick}
        >
          아이디어 제안하기
        </ActionButton>
      </div>
      <ActionButton size='large' variant='tertiaryFill' onClick={handleChatRoomClick}>
        똑독 유저 채팅방
      </ActionButton>
    </div>
  );
};

export { QuickActionsSection };
