'use client';

import { Tooltip, TooltipTrigger, TooltipContent, Switch } from '@knockdog/ui';
import { openSystemSetting } from '@shared/lib/bridge/openSystemSetting';
import { useLocationPermission } from '../lib/useLocationPermission';

function LocationPermissionSection() {
  const { permissionStatus, address } = useLocationPermission();
  const { primaryText, primaryRoad, primaryParcel } = address;

  return (
    <div className='mt-6 flex flex-col gap-y-2 px-4'>
      <div className='flex items-center justify-between'>
        <span className='body2-regular text-text-secondary'>
          집, 직장 외<span className='text-text-accent'> 1개 </span>
          추가 등록 가능
        </span>
        <Tooltip placement='bottom-left'>
          <TooltipTrigger />
          <TooltipContent>
            업체와의 거리를 계산할 때 기준이 되는 <br /> 위치에요. 등록된 기준점으로 거리 비교와 <br /> 거리순 정렬
            기능이 제공되요.
          </TooltipContent>
        </Tooltip>
      </div>
      <div className='flex items-center justify-between py-4'>
        <div className='flex flex-col gap-y-[2px]'>
          <span className='h3-extrabold text-text-primary'>현재 위치</span>
          {permissionStatus === 'allowed' ? (
            <span className='body2-regular text-text-secondary'>{primaryText || primaryRoad || primaryParcel}</span>
          ) : (
            <span className='body2-regular text-text-secondary'>실시간 GPS가 꺼져 있습니다</span>
          )}
        </div>
        <Switch pressed={permissionStatus === 'allowed'} onPressedChange={() => openSystemSetting()} />
      </div>
    </div>
  );
}

export { LocationPermissionSection };
