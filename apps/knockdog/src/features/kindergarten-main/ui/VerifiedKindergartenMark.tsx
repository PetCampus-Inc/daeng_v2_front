'use client';

import { Verified } from '@knockdog/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@knockdog/ui';

function VerifiedKindergartenMark() {
  return (
    <span data-vaul-no-drag className='inline-flex shrink-0 items-center gap-x1'>
      <Verified className='size-x6 shrink-0' />
      <Tooltip placement='bottom-right' closeOnOutsideClick className='flex items-center'>
        <TooltipTrigger aria-label='똑독 인증 안내' className='size-6' data-vaul-no-drag />
        <TooltipContent className='max-w-[230px]'>
          똑독과 함께하는 유치원이에요.
          <br />
          앱에서 유치원 생활을 관리하고,
          <br />
          앞으로 더 많은 기능을 이용할 수 있어요.
        </TooltipContent>
      </Tooltip>
    </span>
  );
}

export { VerifiedKindergartenMark };
