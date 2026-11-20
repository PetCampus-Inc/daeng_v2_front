import Image from 'next/image';

import type { OwnerMembersEmptyContent } from '../config/ownerMembersEmptyContent';

function OwnerMembersEmptyState({ content }: { content: OwnerMembersEmptyContent }) {
  return (
    <div className='px-x5 flex min-h-full w-full flex-col items-center justify-center gap-y-1 pb-(--bottom-bar-height) text-center'>
      <div className='relative h-[200px] w-full max-w-[237px] shrink-0'>
        <Image src={content.imageSrc} alt={content.imageAlt} fill className='object-contain' sizes='237px' />
      </div>
      <div className='flex flex-col items-center gap-y-1'>
        <p className='h2-extrabold text-text-primary'>{content.title}</p>
        <p className='body1-regular text-text-secondary'>{content.description}</p>
      </div>
    </div>
  );
}

export { OwnerMembersEmptyState };
