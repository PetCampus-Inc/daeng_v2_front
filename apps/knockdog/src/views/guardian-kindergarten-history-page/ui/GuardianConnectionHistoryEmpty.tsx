import { guardianConnectionHistoryContent } from '@views/guardian-kindergarten-history-page/config/guardianConnectionHistoryContent';

/** 연결 이력이 하나도 없을 때 */
const GuardianConnectionHistoryEmpty = () => {
  const content = guardianConnectionHistoryContent;

  return (
    <div className='flex flex-col items-center gap-1 px-x4 py-10 text-center'>
      <p className='h3-extrabold text-text-primary'>{content.emptyTitle}</p>
      <p className='body1-regular text-text-secondary'>{content.emptyDescription}</p>
    </div>
  );
};

export { GuardianConnectionHistoryEmpty };
