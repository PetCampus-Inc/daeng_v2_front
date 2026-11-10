import Image from 'next/image';

import { guardianConnectionHistoryContent } from '@views/guardian-kindergarten-history-page/config/guardianConnectionHistoryContent';

/** 연결 이력이 하나도 없을 때 */
const GuardianConnectionHistoryEmpty = () => {
  const content = guardianConnectionHistoryContent;

  return (
    <div className='px-x4 flex min-h-0 flex-1 flex-col items-center justify-center gap-5 pt-8 pb-12 text-center'>
      <div className='relative h-[200px] w-[180px]'>
        <Image
          src={content.emptyImageSrc}
          alt={content.emptyImageAlt}
          fill
          className='object-contain'
          sizes='180px'
          priority
        />
      </div>
      <div className='flex w-full flex-col items-center gap-1'>
        <p className='h2-extrabold text-text-primary'>{content.emptyTitle}</p>
        <p className='body1-regular text-primitive-neutral-500'>{content.emptyDescription}</p>
      </div>
    </div>
  );
};

export { GuardianConnectionHistoryEmpty };
