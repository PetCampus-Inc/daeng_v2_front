'use client';

import { DisconnectButton } from '@knockdog/ui';

import { useOwnerMemberProfileDisconnect } from '../model/useOwnerMemberProfileDisconnect';

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
        void handleDisconnectClick();
      }}
    />
  );
};

export { OwnerMemberProfileDisconnectButton };
