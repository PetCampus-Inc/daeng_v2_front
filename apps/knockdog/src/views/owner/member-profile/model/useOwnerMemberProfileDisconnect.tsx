'use client';

import { useMemo, useRef, useState } from 'react';
import { overlay } from 'overlay-kit';

import { useOwnerRole } from '@features/role-conversion';
import {
  findOwnerMemberByPetId,
  isAlreadyDisconnectedError,
  isDisconnectBlockedError,
  useDisconnectCheckMutation,
  useOwnerMemberDisconnectMutation,
  useOwnerMembersQuery,
  type OwnerMemberDisconnectBodyKind,
  type OwnerMemberDisconnectEligibility,
} from '@entities/owner-member';
import { useUserStore } from '@entities/user';
import { trackConnectionStatus } from '@shared/lib/analytics';
import { openConfirmDialog, useTabNavigation } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';
import { ellipsisText } from '@shared/utils';
import { ownerMemberProfileContent } from '@views/owner/member-profile/config/ownerMemberProfileContent';
import { OwnerMemberProfileDisconnectDialog } from '@views/owner/member-profile/ui/OwnerMemberProfileDisconnectDialog';
import { DisconnectBlockedSheet } from '@views/owner/member-profile/ui/DisconnectBlockedSheet';

interface UseOwnerMemberProfileDisconnectOptions {
  petId: string;
  dogName: string;
  enabled?: boolean;
}

/**
 * 원생 프로필 연결 해제.
 *
 * - 권한 해제(API) 실패 → 공통 오류 토스트 + 프로필 화면 유지
 * - 권한 해제 성공 후 알림·탭 이동·토스트 오류 → 연결 해제 완료로 간주
 * - 보호자 알림/앨범 미노출/당일 등원 일과 노출은 서버 정책
 */
function useOwnerMemberProfileDisconnect({ petId, dogName, enabled = true }: UseOwnerMemberProfileDisconnectOptions) {
  const content = ownerMemberProfileContent;
  const isProcessing = useRef(false);
  const [isChecking, setIsChecking] = useState(false);
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

  const navigateToMembers = async () => {
    // 확인창은 확인을 누를 때 이미 닫혔다. 웹 모달을 닫을 때 생긴 history.back이 목록 이동을 되돌리지 않도록 기다린다.
    if (window.history.state?.__knockdogOverlayId) {
      await new Promise<void>((resolve) => {
        const finish = () => {
          window.removeEventListener('popstate', finish);
          window.clearTimeout(timer);
          resolve();
        };
        const timer = window.setTimeout(finish, 300);
        window.addEventListener('popstate', finish);
      });
    }
    await navigateToTab('/owner/members', undefined, 'owner');
  };

  const resolveMemberId = async () => {
    if (memberId) return memberId;

    const refreshed = await membersQuery.refetch();
    if (refreshed.isError) throw refreshed.error;
    return findOwnerMemberByPetId(refreshed.data?.members ?? [], petId)?.id ?? null;
  };

  /**
   * 그 사이 이용권·예약이 생겨 서버가 해제를 거절(409)한 경우.
   * 거절 응답에는 사유가 없어 해제 가능 여부를 다시 조회해 해제 불가 시트를 연다.
   * 다시 조회한 결과가 해제 가능이거나 조회가 실패하면 프로필에 머물며 실패 토스트를 보여준다.
   */
  const handleServerBlocked = async (blockedMemberId: string): Promise<'failed'> => {
    try {
      const eligibility = await eligibilityMutation.mutateAsync(blockedMemberId);

      if (!eligibility.canDisconnect && eligibility.bodyKind) {
        openBlockedSheet(eligibility, eligibility.bodyKind);
        return 'failed';
      }
    } catch {
      // 다시 조회 실패는 아래 실패 토스트로 처리한다
    }

    showFailToast();
    return 'failed';
  };

  /** 이미 해제된 원생이면 구성원 목록으로 이동하고 안내 토스트를 보여준다(목록은 mutation이 다시 불러온다) */
  const handleAlreadyDisconnected = async (): Promise<'completed'> => {
    try {
      await navigateToMembers();
    } catch {
      // 페이지 이동 실패 무시
    }

    toast({ title: content.alreadyDisconnectedToast });
    return 'completed';
  };

  /**
   * @returns
   * - `'failed'` 권한 해제 실패 — 프로필 복귀
   * - `'completed'` 권한 해제 성공 또는 이미 해제됨(이후 이동/토스트 실패 포함)
   */
  const disconnectAndNotify = async (resolvedMemberId: string): Promise<'failed' | 'completed'> => {
    try {
      await disconnectMutation.mutateAsync(resolvedMemberId);
    } catch (error) {
      if (isDisconnectBlockedError(error)) return handleServerBlocked(resolvedMemberId);
      if (isAlreadyDisconnectedError(error)) return handleAlreadyDisconnected();

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
      await navigateToMembers();
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

  /**
   * 해제 가능 여부를 조회한다.
   * @returns 해제 확인창을 열어도 되면 원생 연결 ID, 그 외(사유 시트·토스트·이동으로 끝난 경우)는 null
   */
  const checkAndDisconnect = async (): Promise<string | null> => {
    let resolvedMemberId: string | null;
    try {
      resolvedMemberId = await resolveMemberId();
    } catch {
      showFailToast();
      return null;
    }
    if (!resolvedMemberId) {
      await handleAlreadyDisconnected();
      return null;
    }

    let eligibility: OwnerMemberDisconnectEligibility;
    try {
      eligibility = await eligibilityMutation.mutateAsync(resolvedMemberId);
    } catch (error) {
      if (isAlreadyDisconnectedError(error)) {
        await handleAlreadyDisconnected();
        return null;
      }
      showFailToast();
      return null;
    }

    if (eligibility.canDisconnect) return resolvedMemberId;

    openBlockedSheet(eligibility, eligibility.bodyKind ?? 'unknown');
    return null;
  };

  /** 확인창이 닫힌 뒤 연결 해제를 시작한다. 처리하는 동안 연결 해제 버튼을 잠근다. */
  const runDisconnect = async (resolvedMemberId: string) => {
    isProcessing.current = true;
    setIsChecking(true);
    try {
      await disconnectAndNotify(resolvedMemberId);
    } finally {
      isProcessing.current = false;
      setIsChecking(false);
    }
  };

  /**
   * 해제 확인창을 연다. 앱에서는 앱 확인창을 먼저 시도하고, 쓸 수 없으면 웹 확인창을 띄운다.
   * 앱 확인창은 답을 기다리는 동안 끝나지 않으므로, 조회 중 잠금이 풀린 뒤에 불러야 한다.
   */
  const openDisconnectDialog = async (resolvedMemberId: string) => {
    const { disconnectDialog } = content;
    const displayDogName = ellipsisText(dogName, disconnectDialog.nameMaxLength);

    const result = await openConfirmDialog({
      title: `${displayDogName}${disconnectDialog.titleSuffix}`,
      titleParts: [{ text: displayDogName, accent: true }, { text: disconnectDialog.titleSuffix }],
      description: disconnectDialog.description,
      cancelLabel: disconnectDialog.cancelLabel,
      confirmLabel: disconnectDialog.confirmLabel,
    });
    if (result.status === 'resolved') {
      if (result.action === 'confirm') await runDisconnect(resolvedMemberId);
      return;
    }
    if (result.status === 'pending') return;

    overlay.open(({ isOpen, close }) => (
      <OwnerMemberProfileDisconnectDialog
        isOpen={isOpen}
        dogName={dogName}
        close={close}
        onDisconnect={() => runDisconnect(resolvedMemberId)}
      />
    ));
  };

  const handleDisconnectClick = async () => {
    if (isProcessing.current) return;
    let memberIdToDisconnect: string | null = null;
    isProcessing.current = true;
    setIsChecking(true);
    try {
      memberIdToDisconnect = await checkAndDisconnect();
    } finally {
      isProcessing.current = false;
      setIsChecking(false);
    }

    if (memberIdToDisconnect) await openDisconnectDialog(memberIdToDisconnect);
  };

  return {
    handleDisconnectClick,
    isDisconnecting: isChecking || disconnectMutation.isPending || eligibilityMutation.isPending,
  };
}

export { useOwnerMemberProfileDisconnect };
