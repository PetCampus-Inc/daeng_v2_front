import { FloatingActionButton } from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { OwnerMembersInviteSheet } from '@views/owner/members/ui/OwnerMembersInviteSheet';

function OwnerMembersInviteButton() {
  const handleInviteClick = () => {
    overlay.open(({ isOpen, close }) => <OwnerMembersInviteSheet isOpen={isOpen} close={close} />);
  };

  return (
    <FloatingActionButton
      type='button'
      icon='Plus'
      label='보호자 초대'
      className='h-x12! w-[118px]! gap-x0_5 px-x3_5! py-x3! absolute right-4 bottom-[calc(var(--bottom-bar-height)+20px)] z-10'
      onClick={handleInviteClick}
    />
  );
}

export { OwnerMembersInviteButton };
