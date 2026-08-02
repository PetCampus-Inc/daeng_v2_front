import { WEEKDAY_LABELS, formatDateKey } from '@shared/lib/calendar-date';

import type { OwnerAlbumPhoto, OwnerAlbumPhotoGroup } from '@views/owner-album-page/model/ownerAlbumPhoto';

function formatAlbumDayTitle(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAY_LABELS[date.getDay()]})`;
}

function groupAlbumPhotosByDate(photos: OwnerAlbumPhoto[]): OwnerAlbumPhotoGroup[] {
  const groups = new Map<string, OwnerAlbumPhoto[]>();

  for (const photo of photos) {
    const date = new Date(photo.uploadedAt);
    const dateKey = formatDateKey(date);
    const existing = groups.get(dateKey) ?? [];
    existing.push(photo);
    groups.set(dateKey, existing);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([dateKey, groupPhotos]) => {
      const sortedPhotos = [...groupPhotos].sort((a, b) => b.uploadedAt - a.uploadedAt);
      return {
        dateKey,
        title: formatAlbumDayTitle(new Date(sortedPhotos[0]!.uploadedAt)),
        photos: sortedPhotos,
      };
    });
}

export { groupAlbumPhotosByDate, formatAlbumDayTitle };
