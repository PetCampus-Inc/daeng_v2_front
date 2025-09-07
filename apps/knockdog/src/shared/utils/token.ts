import { STORAGE_KEYS } from '@shared/constants';

export const tokenUtils = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  setAccessToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  removeAccessToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  hasAccessToken: (): boolean => {
    return !!tokenUtils.getAccessToken();
  },

  removeBearerPrefix: (token: string): string => {
    return token.replace(/^Bearer\s+/i, '');
  },
};
