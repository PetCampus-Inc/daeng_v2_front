'use client';

import { overlay } from 'overlay-kit';

import { Icon, IconButton, Tooltip, TooltipContent, TooltipTrigger } from '@knockdog/ui';

import { OwnerVerificationOnboardingSheet } from './OwnerVerificationOnboardingSheet';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

const OWNER_VERIFICATION_TOOLTIP =
  '유치원 원장님은 사업자 인증 후 직접 운영할 수 있어요';

interface OwnerVerificationEntryProps {
  requiresLogin?: boolean;
  variant?: 'row' | 'banner';
}

function OwnerVerificationEntry({ requiresLogin = true, variant = 'row' }: OwnerVerificationEntryProps) {
  const { push } = useStackNavigation();

  const handleClick = () => {
    if (requiresLogin) {
      push({
        pathname: route.auth.login.root,
        params: { redirectTo: route.roleConversion.kindergartenSearch.root },
      });
      return;
    }

    push({ pathname: route.roleConversion.kindergartenSearch.root });
  };

  const handleOpenOnboarding = () => {
    overlay.open(({ isOpen, close }) => (
      <OwnerVerificationOnboardingSheet isOpen={isOpen} close={close} requiresLogin={requiresLogin} />
    ));
  };

  if (variant === 'banner') {
    return (
      <button
        type='button'
        className='flex w-full items-center justify-between gap-2 rounded-xl bg-[#FFF7EC] p-4 text-left'
        onClick={handleOpenOnboarding}
      >
        <span className='flex flex-col gap-1'>
          <span className='body1-bold flex items-center gap-1 text-text-accent'>
            <Icon icon='KindergartenFill' className='size-5' />
            유치원 원장님이세요?
          </span>
          <span className='body2-regular text-text-primary'>원장님은 사업자 인증 후 직접 운영할 수 있어요</span>
        </span>
        <Icon icon='ChevronRight' className='size-6 shrink-0 text-text-accent' />
      </button>
    );
  }

  return (
    <div className='flex items-center justify-between gap-x-7 py-2'>
      <div className='flex items-center opacity-80'>
        <button type='button' className='h3-semibold text-text-primary' onClick={handleClick}>
          원장 인증하기
        </button>
        <Tooltip placement='bottom-right' className='flex items-center'>
          <TooltipTrigger className='size-6' />
          <TooltipContent className='body2-regular max-w-[195px] px-3 py-3'>
            {OWNER_VERIFICATION_TOOLTIP}
          </TooltipContent>
        </Tooltip>
      </div>
      <IconButton
        type='button'
        icon='ChevronRight'
        className='text-text-tertiary shrink-0'
        onClick={handleClick}
        aria-label='원장 인증하기'
      />
    </div>
  );
}

export { OwnerVerificationEntry };
export type { OwnerVerificationEntryProps };
