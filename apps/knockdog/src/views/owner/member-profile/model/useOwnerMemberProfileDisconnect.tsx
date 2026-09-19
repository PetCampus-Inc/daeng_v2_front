'use client';

import { useMemo } from 'react';
import { overlay } from 'overlay-kit';

import {
  useOwnerMemberDisconnectMutation,
  useOwnerMembersQuery,
} from '@entities/owner-member';
import { useUserStore } from '@entities/user';
import { trackConnectionStatus } from '@shared/lib/analytics';
import { openConfirmDialog, useTabNavigation } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';
import { ellipsisText } from '@shared/utils';
import { ownerMemberProfileContent } from '@views/owner/member-profile/config/ownerMemberProfileContent';
import { OwnerMemberProfileDisconnectDialog } from '@views/owner/member-profile/ui/OwnerMemberProfileDisconnectDialog';

interface UseOwnerMemberProfileDisconnectOptions {
  petId: string;
  dogName: string;
  enabled?: boolean;
}

function useOwnerMemberProfileDisconnect({
  petId,
  dogName,
  enabled = true,
}: UseOwnerMemberProfileDisconnectOptions) {
  const content = ownerMemberProfileContent;
  const { disconnectDialog } = content;
  const userId = useUserStore((state) => state.user?.userId);
  const { navigateToTab } = useTabNavigation();
  const disconnectMutation = useOwnerMemberDisconnectMutation({ userId });
  const membersQuery = useOwnerMembersQuery({
    userId,
    enabled: enabled && Boolean(petId),
  });

  const memberId = useMemo(() => {
    const members = membersQuery.data?.members ?? [];
    return members.find((member) => member.petId === petId)?.id ?? null;
  }, [membersQuery.data?.members, petId]);

  const displayDogName = ellipsisText(dogName, disconnectDialog.nameMaxLength);

  const showSuccessToast = () => {
    toast({
      type: 'success',
      nativeTitle: `${dogName}${content.disconnectSuccessToastSuffix}`,
      titleParts: [
        { text: dogName, accent: true },
        { text: content.disconnectSuccessToastSuffix },
      ],
      title: (
        <>
          <span className='text-text-accent'>{dogName}</span>
          <span className='text-text-primary-inverse'>{content.disconnectSuccessToastSuffix}</span>
        </>
      ),
    });
  };

  const disconnectAndNotify = async () => {
    if (!memberId) {
      toast({ title: content.disconnectMemberNotFoundToast });
      return false;
    }

    try {
      await disconnectMutation.mutateAsync(memberId);
      trackConnectionStatus({ status: 'disconnect', actor: 'owner' });
      await navigateToTab('/owner/members');
      showSuccessToast();
      return true;
    } catch {
      toast({ title: content.disconnectFailToast });
      return false;
    }
  };

  const openWebDisconnectDialog = () => {
    overlay.open(({ isOpen, close }) => (
      <OwnerMemberProfileDisconnectDialog
        isOpen={isOpen}
        dogName={dogName}
        close={close}
        onDisconnect={disconnectAndNotify}
      />
    ));
  };

  const handleDisconnectClick = async () => {
    const result = await openConfirmDialog({
      title: `${displayDogName}${disconnectDialog.titleSuffix}\n${disconnectDialog.titleLine2}`,
      titleParts: [
        { text: displayDogName, accent: true },
        { text: `${disconnectDialog.titleSuffix}\n${disconnectDialog.titleLine2}` },
      ],
      description: disconnectDialog.description,
      cancelLabel: disconnectDialog.cancelLabel,
      confirmLabel: disconnectDialog.confirmLabel,
      contentPaddingHorizontal: 16,
    });

    if (result.status === 'pending') return;

    if (result.status === 'resolved') {
      if (result.action === 'confirm') void disconnectAndNotify();
      return;
    }

    openWebDisconnectDialog();
  };

  return {
    handleDisconnectClick,
    isDisconnecting: disconnectMutation.isPending,
  };
}

export { useOwnerMemberProfileDisconnect };
