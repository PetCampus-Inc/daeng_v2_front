import { ActionButton } from '@knockdog/ui';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { kindergartenSearchContent } from '../config/kindergartenSearchContent';

function KindergartenSearchEmptyResult() {

  const { push } = useStackNavigation();
  const handleRegisterClick = () => {

    push({ pathname: route.roleConversion.kindergartenRegister.root });

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