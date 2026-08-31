import { STORAGE_KEYS } from '@shared/constants';
import { TypedStorage } from '@shared/lib/storage';

import type { EntrySource } from './gaEvents';

const INVITE_ENTRY_SOURCE_QUERY_KEY = 'entry_source';

const inviteEntrySourceStorage = new TypedStorage<EntrySource>(STORAGE_KEYS.INVITE_ENTRY_SOURCE);

function parseEntrySourceFromQuery(search: string | URLSearchParams | null | undefined): EntrySource | null {
  const params = search instanceof URLSearchParams ? search : new URLSearchParams(search ?? '');
  const value = params.get(INVITE_ENTRY_SOURCE_QUERY_KEY);

  if (value === 'invite_qr' || value === 'invite_link') return value;

  return null;
}

function resolveEntrySource(pathname: string | null | undefined, search?: string | URLSearchParams | null): EntrySource {
  const fromSearch = parseEntrySourceFromQuery(search);
  if (fromSearch) return fromSearch;

  if (pathname?.includes('?')) {
    const [, queryString] = pathname.split('?', 2);
    const fromPathQuery = parseEntrySourceFromQuery(queryString);
    if (fromPathQuery) return fromPathQuery;
  }

  const normalizedPath = pathname?.split('?')[0];

  if (normalizedPath?.includes('/invite/')) {
    return inviteEntrySourceStorage.get() ?? 'invite_link';
  }

  return 'organic';
}

function getInviteEntrySource(): EntrySource {
  return inviteEntrySourceStorage.get() ?? 'invite_link';
}

function persistInviteEntrySource(search?: string | URLSearchParams | null) {
  const fromQuery = parseEntrySourceFromQuery(search);
  if (fromQuery) {
    inviteEntrySourceStorage.set(fromQuery);
    return;
  }

  if (typeof window !== 'undefined' && window.location.pathname.includes('/invite/')) {
    if (!inviteEntrySourceStorage.get()) {
      inviteEntrySourceStorage.set('invite_link');
    }
  }
}

function appendInviteQrEntrySource(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set(INVITE_ENTRY_SOURCE_QUERY_KEY, 'invite_qr');
    return parsed.toString();
  } catch {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${INVITE_ENTRY_SOURCE_QUERY_KEY}=invite_qr`;
  }
}

function appendEntrySourceToInvitePath(pathname: string, search?: string | URLSearchParams | null): string {
  const entrySource = parseEntrySourceFromQuery(search) ?? inviteEntrySourceStorage.get();
  if (!entrySource || !pathname.includes('/invite/')) return pathname;

  const separator = pathname.includes('?') ? '&' : '?';
  return `${pathname}${separator}${INVITE_ENTRY_SOURCE_QUERY_KEY}=${entrySource}`;
}

export {
  appendEntrySourceToInvitePath,
  appendInviteQrEntrySource,
  getInviteEntrySource,
  parseEntrySourceFromQuery,
  persistInviteEntrySource,
  resolveEntrySource,
};
