import * as Linking from 'expo-linking';

function handleOpenSystemSetting(event: string): boolean {
  if (event !== 'system.openSystemSetting') return false;

  try {
    Linking.openSettings();
  } catch (error) {
    console.error('[Bridge] openSystemSetting error', error);
    return false;
  }

  return true;
}

export { handleOpenSystemSetting };
