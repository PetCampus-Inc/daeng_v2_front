'use client';

import { useMemo } from 'react';
import { overlay } from 'overlay-kit';

import {
  useOwnerMemberDisconnectMutation,
  useOwnerMembersQuery,
} from '@entities/owner-member';
import { useUserStore } from '@entities/user';
import { trackConnectionStatus } from '@shared/lib/analytics';
import { useTabNavigation } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';
import { ownerMemberProfileContent } from '@views/owner/member-profile/config/ownerMemberProfileContent';
import { OwnerMemberProfileDisconnectDialog } from '@views/owner/member-profile/ui/OwnerMemberProfileDisconnectDialog';

interface UseOwnerMemberProfileDisconnectOptions {
  petId: string;
  dogName: string;
  enabled?: boolean;
}

/**
 * 원생 프로필 연결 해제.
 * 네이티브 confirm 대신 overlay AlertDialog만 사용 —
 * OverlayProvider history trap이 시스템/브라우저 뒤로가기를 가로채 모달만 닫는다.
 */
function useOwnerMemberProfileDisconnect({
  petId,
  dogName,
  enabled = true,
}: UseOwnerMemberProfileDisconnectOptions) {
  const content = ownerMemberProfileContent;
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
    let resolvedMemberId = memberId;

    if (!resolvedMemberId) {
      const refreshed = await membersQuery.refetch();
      resolvedMemberId =
        refreshed.data?.members.find((member) => member.petId === petId)?.id ?? null;
    }

    if (!resolvedMemberId) {
      toast({ title: content.disconnectFailToast });
      return false;
    }

    try {
      await disconnectMutation.mutateAsync(resolvedMemberId);
      trackConnectionStatus({ status: 'disconnect', actor: 'owner' });
      await navigateToTab('/owner/members', undefined, 'owner');
      showSuccessToast();
      return true;
    } catch {
      toast({ title: content.disconnectFailToast });
      return false;
    }
  };

  const handleDisconnectClick = () => {
    // OverlayProvider history trap — 시스템/브라우저 뒤로가기는 모달만 닫음
    overlay.open(({ isOpen, close }) => (
      <OwnerMemberProfileDisconnectDialog
        isOpen={isOpen}
        dogName={dogName}
        close={close}
        onDisconnect={disconnectAndNotify}
      />
    ));
  };

  return {
    handleDisconnectClick,
    isDisconnecting: disconnectMutation.isPending,
  };
}

export { useOwnerMemberProfileDisconnect };
