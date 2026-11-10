import { Divider } from '@knockdog/ui';

export interface SettingsSectionProps {
  otherInfoTitle?: string;
  logoutLabel?: string;
  withdrawLabel?: string;
  onNoticeClick?: () => void;
  onNotificationClick?: () => void;
  onTermsClick?: () => void;
  onLogoutClick?: () => void;
  onWithdrawClick?: () => void;
}

function SettingsSection({
  otherInfoTitle = '기타 정보',
  logoutLabel = '로그아웃',
  withdrawLabel = '탈퇴하기',
  onNoticeClick,
  onNotificationClick,
  onTermsClick,
  onLogoutClick,
  onWithdrawClick,
}: SettingsSectionProps) {
  return (
    <div className='bg-bg-0'>
      <div className='px-4 pt-5 pb-7'>
        <div className='label-medium text-text-secondary mb-4 px-1'>{otherInfoTitle}</div>
        <button type='button' className='body1-medium flex w-full items-center py-2 pr-1 pl-2 text-left' onClick={onNoticeClick}>
          공지사항
        </button>
        <Divider className='border-line-100' />
        <button
          type='button'
          className='body1-medium flex w-full items-center py-2 pr-1 pl-2 text-left'
          onClick={onNotificationClick}
        >
          알림 설정
        </button>
        <Divider className='border-line-100' />
        <button type='button' className='body1-medium flex w-full items-center py-2 pr-1 pl-2 text-left' onClick={onTermsClick}>
          이용약관
        </button>
      </div>

      <div className='flex items-center justify-center gap-4 p-4'>
        <button type='button' className='label-semibold px-2 py-1 text-text-tertiary' onClick={onLogoutClick}>
          {logoutLabel}
        </button>
        <Divider orientation='vertical' className='h-3.5' />
        <button type='button' className='label-semibold px-2 py-1 text-text-tertiary' onClick={onWithdrawClick}>
          {withdrawLabel}
        </button>
      </div>
    </div>
  );
}

export { SettingsSection };
