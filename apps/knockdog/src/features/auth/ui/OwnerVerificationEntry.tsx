'use client';

import { IconButton, Tooltip, TooltipContent, TooltipTrigger } from '@knockdog/ui';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

const OWNER_VERIFICATION_TOOLTIP =
  '유치원 원장님은 사업자 인증 후 직접 운영할 수 있어요';

function OwnerVerificationEntry() {
  const { push } = useStackNavigation();

  const handleClick = () => {
    push({
      pathname: route.auth.login.root,
      params: { redirectTo: route.roleConversion.kindergartenSearch.root },
    });
  };

  return (
    <div
      role='button'
      tabIndex={0}
      className='flex cursor-pointer items-center justify-between gap-x-7 py-2'
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleClick();
        }
      }}
    >
      <div className='flex items-center opacity-80'>
        <span className='h3-semibold text-text-primary'>원장 인증하기</span>
        <div
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <Tooltip placement='bottom-right' className='flex items-center'>
            <TooltipTrigger className='size-6' />
            <TooltipContent className='body2-regular max-w-[195px] px-3 py-3'>
              {OWNER_VERIFICATION_TOOLTIP}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <IconButton icon='ChevronRight' className='text-text-tertiary' />
    </div>
  );
}

export { OwnerVerificationEntry };
