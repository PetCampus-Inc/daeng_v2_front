import * as Linking from 'expo-linking';

function handleOpenSystemSetting(event: string): boolean {
  if (event !== 'system.openSystemSetting') return false;

  Linking.openSettings();

  return true;
}

export { handleOpenSystemSetting };
