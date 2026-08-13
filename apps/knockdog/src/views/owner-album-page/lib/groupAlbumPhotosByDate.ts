import type { OwnerAlbumPhoto, OwnerAlbumPhotoGroup } from '@views/owner-album-page/model/ownerAlbumPhoto';

import {
  formatKstDateLabel,
  formatKstDayLabel,
  formatKstTimeLabel,
  getKstDateKey,
  getKstDateParts,
} from '@shared/lib/calendar-date';

function formatAlbumDayTitle(date: Date) {
  return `${formatKstDateLabel(date)} ${formatKstDayLabel(date)}`;
}

function formatAlbumDetailTitle(date: Date, now = new Date()) {
  const monthDayWeekday = formatAlbumDayTitle(date);
  const dateParts = getKstDateParts(date);
  const nowParts = getKstDateParts(now);
  if (dateParts.year === nowParts.year) return monthDayWeekday;
  return `${dateParts.year}년 ${monthDayWeekday}`;
}

function formatAlbumUploadTime(date: Date) {
  return formatKstTimeLabel(date);
}

function sortAlbumPhotos(photos: OwnerAlbumPhoto[]) {
  return [...photos].sort((left, right) => right.uploadedAt - left.uploadedAt);
}

function getAlbumDayPosition(photos: OwnerAlbumPhoto[], index: number) {
  const current = photos[index];
  if (!current) return { current: 0, total: 0 };

  const dateKey = getKstDateKey(new Date(current.uploadedAt));
  const sameDayPhotos = photos.filter(
    (photo) => getKstDateKey(new Date(photo.uploadedAt)) === dateKey
  );
  const dayIndex = sameDayPhotos.findIndex((photo) => photo.id === current.id);

  return {
    current: dayIndex >= 0 ? dayIndex + 1 : 0,
    total: sameDayPhotos.length,
  };
}

function groupAlbumPhotosByDate(photos: OwnerAlbumPhoto[]): OwnerAlbumPhotoGroup[] {
  const groups = new Map<string, OwnerAlbumPhoto[]>();

  for (const photo of photos) {
    const date = new Date(photo.uploadedAt);
    const dateKey = getKstDateKey(date);
    const existing = groups.get(dateKey) ?? [];
    existing.push(photo);
    groups.set(dateKey, existing);
  }

  return Array.from(groups.entries())
    .sort(([leftKey], [rightKey]) => (leftKey < rightKey ? 1 : leftKey > rightKey ? -1 : 0))
    .map(([dateKey, groupPhotos]) => {
      const sortedPhotos = [...groupPhotos].sort(
        (left, right) => right.uploadedAt - left.uploadedAt
      );
      return {
        dateKey,
        title: formatAlbumDayTitle(new Date(sortedPhotos[0]!.uploadedAt)),
        photos: sortedPhotos,
      };
    });
}

export {
  groupAlbumPhotosByDate,
  formatAlbumDayTitle,
  formatAlbumDetailTitle,
  formatAlbumUploadTime,
  sortAlbumPhotos,
  getAlbumDayPosition,
};
