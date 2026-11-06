import { STORAGE_KEYS } from '@shared/constants';
import { TypedStorage } from '@shared/lib/storage';

const devicePermissionIntroSeen = new TypedStorage<boolean>(STORAGE_KEYS.DEVICE_PERMISSION_INTRO_SEEN, {
  initialValue: false,
});

function hasSeenDevicePermissionIntro() {
  return devicePermissionIntroSeen.get() === true;
}

function markDevicePermissionIntroSeen() {
  devicePermissionIntroSeen.set(true);
}

export { hasSeenDevicePermissionIntro, markDevicePermissionIntroSeen };
