import { Divider, Icon } from '@knockdog/ui';

interface SettingsSectionProps {
  version: string;
  hasUpdate?: boolean;
  onNoticeClick?: () => void;
  onNotificationClick?: () => void;
  onTermsClick?: () => void;
  onLicenseClick?: () => void;
  onUpdateClick?: () => void;
}

function SettingsSection({
  version,
  hasUpdate,
  onNoticeClick,
  onNotificationClick,
  onTermsClick,
  onLicenseClick,
  onUpdateClick,
}: SettingsSectionProps) {
  return (
    <div className='bg-primitive-neutral-50 px-4 py-7'>
      <div className='body2-semibold text-text-tertiary mb-2'>기타 정보</div>
      <div>
        <button className='body1-medium py-5' onClick={onNoticeClick}>
          공지 및 이벤트
        </button>
        <Divider />
      </div>
      <div>
        <button className='body1-medium py-5' onClick={onNotificationClick}>
          알림 설정
        </button>
        <Divider />
      </div>
      <div>
        <div className='body1-medium py-5' onClick={onTermsClick}>
          이용약관
        </div>
        <Divider />
      </div>
      <div>
        <div className='body1-medium py-5' onClick={onLicenseClick}>
          오픈소스 라이선스
        </div>
        <Divider />
      </div>
      <div>
        <div className='body1-medium flex items-center justify-between py-5'>
          <div className='flex items-center gap-x-1'>
            <span className='body1-medium'>버전 정보</span>
            <div className='relative'>
              <span className='body2-regular text-primitive-neutral-600 ml-1'>{version}</span>
              <Icon icon='King' className='text-text-accent absolute top-0 -right-2 size-2' />
            </div>
          </div>
          {hasUpdate && (
            <span className='label-semibold text-text-accent' onClick={onUpdateClick}>
              업데이트 하기
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export { SettingsSection };
