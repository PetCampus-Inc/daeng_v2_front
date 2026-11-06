import { ApiError } from '@shared/api';

const UNAVAILABLE_NOTIFICATION_TOAST = '확인할 수 없는 알림이에요';

type NotificationEntrySource = 'push' | 'inbox';

function parseNotificationEntrySource(value: string | null | undefined): NotificationEntrySource | null {
  if (value === 'push' || value === 'inbox') return value;
  return null;
}

function isUnavailableResourceError(error: unknown) {
  return error instanceof ApiError && (error.status === 403 || error.status === 404);
}

function isPetIdInList(pets: Array<{ id: string }>, petId: string) {
  return pets.some((pet) => String(pet.id) === String(petId));
}

export {
  UNAVAILABLE_NOTIFICATION_TOAST,
  isPetIdInList,
  isUnavailableResourceError,
  parseNotificationEntrySource,
};
export type { NotificationEntrySource };
