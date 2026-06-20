import { ActionButton, Icon } from '@knockdog/ui';

import { kindergartenSearchContent } from '../config/kindergartenSearchContent';

function KindergartenSearchEmptyResult() {
  const handleRegisterClick = () => {
    // @todo 유치원 직접 등록 라우팅
  };

  return (
    <div className='flex flex-col gap-5 py-5'>
      <div className='flex flex-col gap-1 text-center'>
        <p className='h3-semibold text-text-primary'>{kindergartenSearchContent.emptyTitle}</p>
        <p className='body1-regular text-text-secondary'>{kindergartenSearchContent.emptyDescription}</p>
      </div>

      <ActionButton
        type='button'
        variant='secondaryFill'
        size='large'
        className='w-full'
        onClick={handleRegisterClick}
      >
        {kindergartenSearchContent.registerButtonLabel}
      </ActionButton>
    </div>
  );
}

export { KindergartenSearchEmptyResult };
