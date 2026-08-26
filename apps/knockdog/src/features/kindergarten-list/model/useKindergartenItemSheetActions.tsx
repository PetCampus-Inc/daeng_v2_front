import { useCallback } from 'react';
import { overlay } from 'overlay-kit';
import { useShare } from '@shared/lib';
import type { KindergartenMain } from '@entities/kindergarten';
import { PhoneCallSheet } from '../ui/PhoneCallSheet';
import { useDetailBookmarkToggle } from './useDetailBookmarkToggle';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? '';

interface UseKindergartenItemSheetActionsParams {
  displayData?: KindergartenMain;
  id: string;
  coords: { lat: number; lng: number };
}

export function useKindergartenItemSheetActions({
  displayData,
  id,
  coords,
}: UseKindergartenItemSheetActionsParams) {
  const share = useShare();
  const { mutate: toggleBookmark } = useDetailBookmarkToggle({ id, lng: coords.lng, lat: coords.lat });

  const onBookmarkClick = useCallback(
    (targetId: string, bookmarked: boolean) => {
      toggleBookmark({ id: targetId, bookmarked });
    },
    [toggleBookmark]
  );

  const onShare = useCallback(() => {
    if (!displayData) return;
    share({ url: `${WEB_URL}/kindergarten/${displayData.id}` });
  }, [displayData, share]);

  const onPhoneCall = useCallback(() => {
    overlay.open(({ isOpen, close }) => (
      <PhoneCallSheet isOpen={isOpen} close={close} phoneNumber={displayData?.phoneNumber ?? ''} />
    ));
  }, [displayData?.phoneNumber]);

  return { onBookmarkClick, onShare, onPhoneCall };
}
