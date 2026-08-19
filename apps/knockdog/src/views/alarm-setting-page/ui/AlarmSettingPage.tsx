'use client';

import { Divider, Icon, Switch } from '@knockdog/ui';
import { overlay } from 'overlay-kit';
import { Header } from '@widgets/Header';
import { MarketingConsentSheet } from '@features/marketing-consent';
import { usePushSettingQuery, usePushSettingMutation, type PushSetting } from '@entities/user';
import { useStackNavigation } from '@shared/lib/bridge';
import { PrivateAccess } from '@shared/ui/private-access';

function AlarmSettingPage() {
  const { push } = useStackNavigation();
  const { data: pushSetting } = usePushSettingQuery();
  const { mutate: updatePushSetting } = usePushSettingMutation();

  const handleUpdateSetting = (updates: Partial<PushSetting>) => {
    if (!pushSetting) return;

    updatePushSetting({
      ...pushSetting,
      ...updates,
    });
  };

  const openTermsBottomSheet = () => {
    overlay.open(({ isOpen, close }) => <MarketingConsentSheet isOpen={isOpen} close={close} />);
  };

  return (
    <PrivateAccess>
      <Header>
        <Header.BackButton />
        <Header.Title>알림 설정</Header.Title>
      </Header>

      <div className='px-4 pt-5 pb-4'>
        <div className='flex items-center justify-between gap-2 py-4'>
          <div>
            <h4 className='body1-bold text-text-primary'>알림 받기</h4>
            <span className='text-text-secondary body2-regular'>서비스 업데이트, 유치원 소식 등 알림</span>
          </div>
          <Switch
            key={`app-push-${pushSetting?.app_push}`}
            pressed={pushSetting?.app_push ?? false}
            onPressedChange={(checked) => {
              handleUpdateSetting({ app_push: checked });
            }}
          />
        </div>
        <div className='flex items-center justify-between gap-2'>
          <span className='text-text-primary body2-regular'>알림을 꺼도 알림함에서는 확인할 수 있어요.</span>
        </div>
      </div>
    </PrivateAccess>
  );
}

export { AlarmSettingPage };
