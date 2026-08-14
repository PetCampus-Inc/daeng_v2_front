'use client';

import Image from 'next/image';

import {
  STOOL_STATUS_IMAGE,
  STOOL_STATUS_LABEL,
  type StoolStatus,
} from '../config/stoolStatus';

interface StoolStatusBadgeProps {
  status: StoolStatus;
  className?: string;
}

function StoolStatusBadge({ status, className }: StoolStatusBadgeProps) {
  const label = STOOL_STATUS_LABEL[status];

  return (
    <div className={`flex w-16 flex-col items-center gap-1 ${className ?? ''}`}>
      <div className='relative h-[62px] w-16 shrink-0 overflow-hidden rounded-lg'>
        <Image
          src={STOOL_STATUS_IMAGE[status]}
          alt={label}
          fill
          className='object-contain'
          sizes='64px'
        />
      </div>
      <span className='label-medium text-text-accent'>{label}</span>
    </div>
  );
}

export { StoolStatusBadge };
export type { StoolStatusBadgeProps };
