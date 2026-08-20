'use client';

import { route } from '@shared/constants/route';
import { useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { notificationInboxContent } from '@views/notification-inbox-page/config/notificationInboxContent';
import type { NotificationInboxItem } from '@views/notification-inbox-page/config/notificationInboxTypes';
import { resolveNotificationInboxDestination } from '@views/notification-inbox-page/lib/resolveNotificationInboxDestination';
import { toast } from '@shared/ui/toast';
import { pushGuardianDailyNoticeDetail } from '@views/guardian-kindergarten-page/lib/pushGuardianDailyNoticeDetail';
import { useGuardianSelectedPetStore } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPetStore';

function parseLocalDateKey(value: string) {
  const [yearText, monthText, dayText] = value.split('-');
  return new Date(Number(yearText), Number(monthText) - 1, Number(dayText));
}

function useNotificationInboxDeepLink() {
  const { push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const setSelectedPetId = useGuardianSelectedPetStore((state) => state.setSelectedPetId);

  const openNotification = (item: NotificationInboxItem) => {
    if (item.isTargetUnavailable) {
      toast(notificationInboxContent.pageNotFoundToast);
      return;
    }

    const destination = resolveNotificationInboxDestination(item.type, item.payload);

    switch (destination.kind) {
      case 'attendanceRecord':
        setSelectedPetId(destination.petId);
        pushGuardianDailyNoticeDetail(push, parseLocalDateKey(destination.date), destination.petId);
        return;
      case 'guardianKindergarten':
        setSelectedPetId(destination.petId);
        void navigateToTab('/compare', {
          pushPetId: destination.petId,
        });
        return;
      case 'ownerMemberApprovals':
        void push({ pathname: route.owner.members.approval.root });
        return;
      case 'connectionApplyStatus':
        void push({ pathname: route.guardian.connectionApply.status.root });
        return;
      case 'album':
        if (destination.petId) setSelectedPetId(destination.petId);
        void push({ pathname: route.compare.album.root });
        return;
      default:
        toast(notificationInboxContent.pageNotFoundToast);
    }
  };

  return { openNotification };
}

export { useNotificationInboxDeepLink };
