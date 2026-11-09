import { overlay } from 'overlay-kit';
import { Icon, SearchField } from '@knockdog/ui';
import {
  OWNER_MEMBER_SEARCH_MAX_LENGTH,
  ownerMembersContent,
} from '@views/owner-members-page/config/ownerMembersContent';
import { OwnerMembersInviteSheet } from '@views/owner-members-page/ui/OwnerMembersInviteSheet';
import { Header } from '@widgets/Header';
import { useHasUnreadNotificationQuery } from '@entities/notification';
import { useUserStore } from '@entities/user';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { useFocusScrollLock } from '@shared/lib/device';
import { NotificationBell } from '@shared/ui/notification-bell';

interface OwnerMembersHeroProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}

/** 구성원 화면 위쪽: 제목·QR코드·알림과 검색창 */
function OwnerMembersHero({ searchQuery, onSearchQueryChange }: OwnerMembersHeroProps) {
  const { push } = useStackNavigation();
  const userId = useUserStore((state) => state.user?.userId);
  const { data: hasUnreadNotification = false } = useHasUnreadNotificationQuery({
    userId,
    audience: 'OWNER',
    enabled: true,
  });
  const { fieldRef, handleFocus, handleBlur, handlePointerDown } = useFocusScrollLock<HTMLInputElement>();

  const handleInviteClick = () => {
    overlay.open(({ isOpen, close }) => <OwnerMembersInviteSheet isOpen={isOpen} close={close} />);
  };

  return (
    <div className='bg-bg-0 pt-(--safe-area-inset-top,0px)'>
      <Header>
        <Header.Title>구성원</Header.Title>
        <Header.RightSection>
          <button
            type='button'
            aria-label='보호자 초대 QR코드'
            data-testid='owner-members-qr-button'
            onClick={handleInviteClick}
          >
            <Icon icon='Qr' className='text-text-primary size-6' />
          </button>
          <NotificationBell
            hasUnread={hasUnreadNotification}
            onClick={() => push({ pathname: route.notification.root })}
          />
        </Header.RightSection>
      </Header>

      <div className='px-x4 pt-x5 pb-x4'>
        <SearchField
          ref={fieldRef}
          type='search'
          inputMode='search'
          value={searchQuery}
          maxLength={OWNER_MEMBER_SEARCH_MAX_LENGTH}
          placeholder={ownerMembersContent.searchPlaceholder}
          aria-label='구성원 검색어 입력'
          onChange={(event) => onSearchQueryChange(event.target.value)}
          onPointerDown={handlePointerDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>
    </div>
  );
}

export { OwnerMembersHero };
