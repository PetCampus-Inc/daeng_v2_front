'use client';

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
        void navigateToTab('/compare', {
          pushPetId: destination.petId,
          source: 'inbox',
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
