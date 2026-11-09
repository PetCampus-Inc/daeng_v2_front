'use client';

import { useMemo } from 'react';
import { overlay } from 'overlay-kit';

import { useOwnerRole } from '@features/role-conversion';
import {
  findOwnerMemberByPetId,
  useDisconnectCheckMutation,
  useOwnerMemberDisconnectMutation,
  useOwnerMembersQuery,
  type OwnerMemberDisconnectBodyKind,
  type OwnerMemberDisconnectEligibility,
} from '@entities/owner-member';
import { useUserStore } from '@entities/user';
import { trackConnectionStatus } from '@shared/lib/analytics';
import { useTabNavigation } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';
import { ownerMemberProfileContent } from '@views/owner/member-profile/config/ownerMemberProfileContent';
import { DisconnectBlockedSheet } from '@views/owner/member-profile/ui/DisconnectBlockedSheet';
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
  const { kindergarten } = useOwnerRole();
  const kindergartenName = kindergarten?.name ?? '';
  const disconnectMutation = useOwnerMemberDisconnectMutation({ userId });
  const eligibilityMutation = useDisconnectCheckMutation();
  const membersQuery = useOwnerMembersQuery({
    userId,
    enabled: enabled && Boolean(petId),
  });

  const memberId = useMemo(
    () => findOwnerMemberByPetId(membersQuery.data?.members ?? [], petId)?.id ?? null,
    [membersQuery.data?.members, petId]
  );

  const showSuccessToast = () => {
    // 성공 토스트는 이름에 강조색을 쓰지 않는다 (Figma `36:16665`)
    const successTitle = `${dogName}${content.disconnectSuccessToastSuffix}`;

    toast({ type: 'success', title: successTitle, nativeTitle: successTitle });
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
      trackConnectionStatus({
        status: 'disconnect',
        initiated_by: 'owner',
        school_pet_membership_id: resolvedMemberId,
        reason: 'manual',
      });
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

  const openConfirmDialog = () => {
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

  const openBlockedSheet = (eligibility: OwnerMemberDisconnectEligibility, bodyKind: OwnerMemberDisconnectBodyKind) => {
    overlay.open(({ isOpen, close }) => (
      <DisconnectBlockedSheet
        isOpen={isOpen}
        close={close}
        bodyKind={bodyKind}
        blocks={eligibility.blocks}
        kindergartenName={kindergartenName}
      />
    ));
  };

  /** `연결해제`를 누르면 해제 가능 여부를 새로 조회해 시트(해제 불가) 또는 확인 모달(해제 가능)을 연다 */
  const handleDisconnectClick = async () => {
    const resolvedMemberId = await resolveMemberId();
    if (!resolvedMemberId) {
      showFailToast();
      return;
    }

    let eligibility: OwnerMemberDisconnectEligibility;
    try {
      eligibility = await eligibilityMutation.mutateAsync(resolvedMemberId);
    } catch {
      showFailToast();
      return;
    }

    if (eligibility.canDisconnect || !eligibility.bodyKind) {
      openConfirmDialog();
      return;
    }

    openBlockedSheet(eligibility, eligibility.bodyKind);
  };

  return {
    handleDisconnectClick,
    isDisconnecting: disconnectMutation.isPending || eligibilityMutation.isPending,
  };
}

export { useOwnerMemberProfileDisconnect };
