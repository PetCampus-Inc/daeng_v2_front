'use client';

import { Tooltip, TooltipTrigger, TooltipContent, Switch, Icon } from '@knockdog/ui';
import { openSystemSetting } from '@shared/lib/bridge/openSystemSetting';
import { useLocationPermission } from '../lib/useLocationPermission';

function LocationPermissionSection() {
  const { permissionStatus, address, requestPermission } = useLocationPermission();

  return (
    <div className='mt-5 flex flex-col gap-y-2 px-4'>
      <div className='flex items-center justify-between'>
        <span className='body2-regular text-text-secondary'>
          집, 직장 외<span className='text-text-accent'> 1개 </span>
          추가 등록 가능
        </span>
        <Tooltip placement='bottom-left'>
          <TooltipTrigger>
            <Icon className='group-data-[state=closed]:hidden text-text-tertiary' icon='TooltipFill' />
            <Icon className='group-data-[state=open]:hidden text-text-tertiary' icon='TooltipLine' />
          </TooltipTrigger>
          <TooltipContent>
            유치원과의 거리를 계산할 때 기준이 되는 <br /> 위치예요. 등록된 주소를 기준으로 거리 <br /> 비교와 거리순 정렬 기능이 제공돼요.
          </TooltipContent>
        </Tooltip>
      </div>
      <div className='flex items-center justify-between py-4'>
        <div className='flex flex-col gap-y-[2px]'>
          <span className='h3-extrabold text-text-primary'>현재 위치</span>
          {permissionStatus === 'allowed' ? (
            <span className='body2-regular text-text-secondary'>
              {address.addressName || '위치 정보를 찾을 수 없음'}
            </span>
          ) : (
            <span className='body2-regular text-text-secondary'>실시간 GPS가 꺼져 있습니다</span>
          )}
        </div>
        <Switch
          pressed={permissionStatus === 'allowed'}
          onPressedChange={() => {
            if (permissionStatus === 'allowed') {
              // 1. 이미 허용 상태면 설정을 열어서 끄도록 유도
              openSystemSetting();
            } else if (permissionStatus === 'denied') {
              // 2. 거절 상태면 설정을 열어서 켜도록 유도
              openSystemSetting();
            } else {
              // 3. 미정 상태면 앱 내 팝업으로 권한 요청
              requestPermission();
            }
          }}
        />
      </div>
    </div>
  );
}

export { LocationPermissionSection };
