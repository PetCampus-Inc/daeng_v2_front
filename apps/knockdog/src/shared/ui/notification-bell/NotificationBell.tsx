import { Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

interface NotificationBellProps {
  hasUnread: boolean;
  onClick: () => void;
  inverse?: boolean;
}

/** 헤더에서 사용하는 알림함 이동 버튼. 읽지 않은 알림이 있으면 활성 아이콘을 표시한다. */
function NotificationBell({ hasUnread, onClick, inverse = false }: NotificationBellProps) {
  return (
    <button type='button' aria-label='알림함' onClick={onClick}>
      <Icon
        icon={hasUnread ? 'AlarmLineActive' : 'AlarmNone'}
        className={cn(
          'size-6',
          inverse ? 'text-text-primary-inverse [&>circle]:fill-white [&>circle]:stroke-white' : 'text-text-primary'
        )}
      />
    </button>
  );
}

export { NotificationBell, type NotificationBellProps };
