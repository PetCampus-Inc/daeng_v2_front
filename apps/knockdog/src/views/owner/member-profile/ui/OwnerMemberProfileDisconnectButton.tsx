'use client';

import { DisconnectButton } from '@knockdog/ui';

import { useOwnerMemberProfileDisconnect } from '@views/owner/member-profile/model/useOwnerMemberProfileDisconnect';

interface OwnerMemberProfileDisconnectButtonProps {
  petId: string;
  dogName: string;
}

const OwnerMemberProfileDisconnectButton = ({
  petId,
  dogName,
}: OwnerMemberProfileDisconnectButtonProps) => {
  const { handleDisconnectClick, isDisconnecting } = useOwnerMemberProfileDisconnect({
    petId,
    dogName,
  });

  return (
    <DisconnectButton
      type='button'
      disabled={isDisconnecting}
      onClick={() => {
        handleDisconnectClick().catch(() => undefined);
      }}
    />
  );
};

export { OwnerMemberProfileDisconnectButton };
