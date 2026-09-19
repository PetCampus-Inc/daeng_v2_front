'use client';

import { useMemo } from 'react';
import { overlay } from 'overlay-kit';

import {
  findOwnerMemberByPetId,
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
 *
 * - 권한 해제(API) 실패 → 공통 오류 토스트 + 프로필 화면 유지(모달 닫음)
 * - 권한 해제 성공 후 알림·탭 이동·토스트 오류 → 연결 해제 완료로 간주
 * - 보호자 알림/앨범 미노출/당일 등원 일과 노출은 서버 정책
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

  const memberId = useMemo(
    () => findOwnerMemberByPetId(membersQuery.data?.members ?? [], petId)?.id ?? null,
    [membersQuery.data?.members, petId]
  );

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

  const showFailToast = () => {
    toast({ title: content.disconnectFailToast });
  };

  const resolveMemberId = async () => {
    if (memberId) return memberId;

    const refreshed = await membersQuery.refetch();
    return findOwnerMemberByPetId(refreshed.data?.members ?? [], petId)?.id ?? null;
  };

  /**
   * @returns
   * - `'failed'` 권한 해제 실패 — 프로필 복귀
   * - `'completed'` 권한 해제 성공(이후 이동/토스트 실패 포함)
   */
  const disconnectAndNotify = async (): Promise<'failed' | 'completed'> => {
    const resolvedMemberId = await resolveMemberId();

    if (!resolvedMemberId) {
      showFailToast();
      return 'failed';
    }

    try {
      await disconnectMutation.mutateAsync(resolvedMemberId);
    } catch {
      // 서버 원복 가정 — 프론트는 낙관적 미적용이므로 캐시 그대로 + 프로필 복귀
      showFailToast();
      return 'failed';
    }

    // 여기부터 연결 해제 완료. 알림은 서버 발송. 이동/토스트 오류는 무시.
    try {
      trackConnectionStatus({ status: 'disconnect', actor: 'owner' });
    } catch {
      // analytics 실패 무시
    }

    try {
      await navigateToTab('/owner/members', undefined, 'owner');
    } catch {
      // 페이지 이동 실패도 해제 완료로 간주
    }

    try {
      showSuccessToast();
    } catch {
      // 토스트 실패 무시
    }

    return 'completed';
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
