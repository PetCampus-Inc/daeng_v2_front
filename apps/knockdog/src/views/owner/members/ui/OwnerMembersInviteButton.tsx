import { FloatingActionButton } from '@knockdog/ui';

function OwnerMembersInviteButton() {
  return (
    <FloatingActionButton
      type='button'
      icon='Plus'
      label='보호자 초대'
      className='h-x12! w-[118px]! gap-x0_5 px-x3_5! py-x3! absolute right-4 bottom-[calc(var(--bottom-bar-height)+20px)] z-10'
    />
  );
}

export { OwnerMembersInviteButton };
