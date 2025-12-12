import { Icon } from '@knockdog/ui';
import { TOTAL_SERVICE_MAP, SERVICE_ICON_MAP } from '../model/constants/dog-service';
import { ServiceCode } from '../model/dog-service';

interface ServiceTagBadgeProps {
  code: string;
}

function ServiceTagBadge({ code }: ServiceTagBadgeProps) {
  if (!SERVICE_ICON_MAP[code as ServiceCode]) {
    return null;
  }

  return (
    <div className='flex flex-col items-center'>
      <Icon icon={SERVICE_ICON_MAP[code as ServiceCode]} className='h-8 w-8' />
      <span className='caption1-semibold text-neutral-900'>{TOTAL_SERVICE_MAP[code as ServiceCode]}</span>
    </div>
  );
}

export { ServiceTagBadge };
