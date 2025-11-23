import * as Linking from 'expo-linking';
import { METHODS } from '@knockdog/bridge-core';

function handleSystemEvent(event: string, payload: unknown): boolean {
  if (event !== METHODS.openExternalLink) return false;

  const { url } = (payload ?? {}) as { url?: string };

  if (!url || typeof url !== 'string') {
    if (__DEV__) {
      console.warn('[Bridge] invalid openExternalLink payload', payload);
    }
    return true;
  }

  Linking.openURL(url).catch((error) => {
    console.error('[Bridge] openExternalLink error', error);
  });

  return true;
}

export { handleSystemEvent };
