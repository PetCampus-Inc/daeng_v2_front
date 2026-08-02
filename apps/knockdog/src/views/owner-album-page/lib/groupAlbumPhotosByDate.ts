import { WEEKDAY_LABELS, formatDateKey } from '@shared/lib/calendar-date';

import type { OwnerAlbumPhoto, OwnerAlbumPhotoGroup } from '@views/owner-album-page/model/ownerAlbumPhoto';

function formatAlbumDayTitle(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAY_LABELS[date.getDay()]})`;
}

function formatAlbumDetailTitle(date: Date, now = new Date()) {
  const monthDayWeekday = formatAlbumDayTitle(date);
  if (date.getFullYear() === now.getFullYear()) return monthDayWeekday;
  return `${date.getFullYear()}년 ${monthDayWeekday}`;
}

function formatAlbumUploadTime(date: Date) {
  const hour = date.getHours();
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour % 12 || 12;
  const displayMinute = String(date.getMinutes()).padStart(2, '0');
  return `${period} ${displayHour}:${displayMinute}`;
}

function sortAlbumPhotos(photos: OwnerAlbumPhoto[]) {
  return [...photos].sort((a, b) => b.uploadedAt - a.uploadedAt);
}

function getAlbumDayPosition(photos: OwnerAlbumPhoto[], index: number) {
  const current = photos[index];
  if (!current) return { current: 0, total: 0 };

  const dateKey = formatDateKey(new Date(current.uploadedAt));
  const sameDayPhotos = photos.filter((photo) => formatDateKey(new Date(photo.uploadedAt)) === dateKey);
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

export {
  groupAlbumPhotosByDate,
  formatAlbumDayTitle,
  formatAlbumDetailTitle,
  formatAlbumUploadTime,
  sortAlbumPhotos,
  getAlbumDayPosition,
};
