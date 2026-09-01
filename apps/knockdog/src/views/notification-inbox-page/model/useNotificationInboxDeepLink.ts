'use client';

import { useMypageRoleViewStore } from '@features/role-conversion';

import { route } from '@shared/constants/route';
import { useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { isPetIdInList } from '@shared/lib/notification';
import { toast } from '@shared/ui/toast';
import { pushGuardianDailyNoticeDetail } from '@views/guardian-kindergarten-page/lib/pushGuardianDailyNoticeDetail';
import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';
import { useGuardianSelectedPetStore } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPetStore';
import { notificationInboxContent } from '@views/notification-inbox-page/config/notificationInboxContent';
import type { NotificationInboxItem } from '@views/notification-inbox-page/config/notificationInboxTypes';
import { resolveNotificationInboxDestination } from '@views/notification-inbox-page/lib/resolveNotificationInboxDestination';

function parseLocalDateKey(value: string) {
  const [yearText, monthText, dayText] = value.split('-');
  return new Date(Number(yearText), Number(monthText) - 1, Number(dayText));
}

/** 이동한 경로만 보고 보호자/원장 컨텍스트를 판별한다. 목적지 종류가 늘어나도
 * 경로 규칙(guardian/owner 프리픽스, /compare)만 맞으면 되므로, 케이스마다
 * 처리를 깜빡여서 "이 알림만 다른 탭으로 이동하면 원장으로 되돌아간다"는 문제가
 * 생기는 걸 막는다. 네이티브 푸시 쪽(pushCoordinator.ts)과 같은 판별 규칙. */
function resolvePrefersGuardianViewFromPath(pathname: string): boolean | null {
  if (pathname.startsWith('/guardian/') || pathname.startsWith('/compare')) return true;
  if (pathname.startsWith('/owner/')) return false;
  return null;
}

function applyGuardianViewForPath(pathname: string) {
  const value = resolvePrefersGuardianViewFromPath(pathname);
  if (value === null) return;
  useMypageRoleViewStore.getState().setPrefersGuardianView(value);
}

function useNotificationInboxDeepLink() {
  const { push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const { pets, isPetsReady, isPetsError } = useGuardianSelectedPet();
  const setSelectedPetId = useGuardianSelectedPetStore((state) => state.setSelectedPetId);

  const openNotification = (item: NotificationInboxItem) => {
    if (item.isTargetUnavailable) {
      toast(notificationInboxContent.pageNotFoundToast);
      return;
    }

    const destination = resolveNotificationInboxDestination(item.type, item.payload);
    const destinationPetId = 'petId' in destination ? destination.petId : undefined;
    const canValidatePetList = isPetsReady && !isPetsError;

    if (
      destinationPetId &&
      canValidatePetList &&
      !isPetIdInList(pets, destinationPetId)
    ) {
      toast(notificationInboxContent.pageNotFoundToast);
      return;
    }

    switch (destination.kind) {
      case 'attendanceRecord':
        pushGuardianDailyNoticeDetail(push, parseLocalDateKey(destination.date), {
          petId: destination.petId,
          source: 'inbox',
        });
        return;
      case 'guardianKindergarten':
        applyGuardianViewForPath('/compare');
        void navigateToTab('/compare', {
          pushPetId: destination.petId,
          source: 'inbox',
        });
        return;
      case 'ownerMemberApprovals':
        applyGuardianViewForPath(route.owner.members.approval.root);
        void push({ pathname: route.owner.members.approval.root });
        return;
      case 'connectionApplyStatus':
        applyGuardianViewForPath(route.guardian.connectionApply.status.root);
        void push({ pathname: route.guardian.connectionApply.status.root });
        return;
      case 'album':
        applyGuardianViewForPath(route.compare.album.root);
        if (destination.petId) setSelectedPetId(destination.petId);
        void push({
          pathname: route.compare.album.root,
          query: {
            ...(destination.schoolId && { schoolId: destination.schoolId }),
            ...(destination.date && { date: destination.date }),
          },
        });
        return;
      default:
        toast(notificationInboxContent.pageNotFoundToast);
    }
  };

  return { openNotification };
}

export { useNotificationInboxDeepLink };
