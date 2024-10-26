'use client';

import { Icon, iconTypes } from '@knockdog/ui';

export default function IconsPage() {
  return (
    <div className='grid max-w-screen-md grid-cols-4 gap-5 p-6'>
      {iconTypes.map((icon) => (
        <div
          key={icon}
          className='shadow-card flex flex-col items-center gap-2 rounded-md px-1 py-2'
        >
          <Icon icon={icon} className='size-10' />
          <span className='typo-caption-12-b text-gray1'>{icon}</span>
        </div>
      ))}
    </div>
  );
}
