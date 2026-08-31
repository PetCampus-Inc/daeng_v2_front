import { STORAGE_KEYS } from '@shared/constants';
import { TypedStorage } from '@shared/lib/storage';

import type { EntrySource } from './gaEvents';

const INVITE_ENTRY_SOURCE_QUERY_KEY = 'entry_source';
const INVITE_GUARDIAN_TOKEN_PATTERN = /\/invite\/guardian\/([^/?#]+)/;

type InviteEntrySourceMap = Record<string, EntrySource>;

const inviteEntrySourceMapStorage = new TypedStorage<InviteEntrySourceMap>(STORAGE_KEYS.INVITE_ENTRY_SOURCE_BY_TOKEN);

function extractInviteTokenFromPath(pathname: string): string | null {
  const match = pathname.match(INVITE_GUARDIAN_TOKEN_PATTERN);
  if (!match?.[1]) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function readInviteEntrySourceMap(): InviteEntrySourceMap {
  const stored = inviteEntrySourceMapStorage.get();
  if (!stored || typeof stored !== 'object') return {};
  return stored;
}

function setInviteEntrySourceForToken(token: string, entrySource: EntrySource) {
  const map = readInviteEntrySourceMap();
  map[token] = entrySource;
  inviteEntrySourceMapStorage.set(map);
}

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

  const normalizedPath = pathname?.split('?')[0] ?? '';
  const inviteToken = extractInviteTokenFromPath(normalizedPath);

  if (inviteToken) {
    return readInviteEntrySourceMap()[inviteToken] ?? 'invite_link';
  }

  return 'organic';
}

function getInviteEntrySource(token?: string | null): EntrySource {
  const resolvedToken =
    token ??
    (typeof window !== 'undefined' ? extractInviteTokenFromPath(window.location.pathname) : null);

  if (!resolvedToken) return 'invite_link';

  return readInviteEntrySourceMap()[resolvedToken] ?? 'invite_link';
}

function persistInviteEntrySource(search?: string | URLSearchParams | null, token?: string | null) {
  const resolvedToken =
    token ??
    (typeof window !== 'undefined' ? extractInviteTokenFromPath(window.location.pathname) : null);

  if (!resolvedToken) return;

  const fromQuery = parseEntrySourceFromQuery(search);
  if (fromQuery) {
    setInviteEntrySourceForToken(resolvedToken, fromQuery);
    return;
  }

  if (typeof window !== 'undefined' && window.location.pathname.includes('/invite/')) {
    const map = readInviteEntrySourceMap();
    if (!map[resolvedToken]) {
      setInviteEntrySourceForToken(resolvedToken, 'invite_link');
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
  const inviteToken = extractInviteTokenFromPath(pathname.split('?')[0] ?? pathname);
  const entrySource = parseEntrySourceFromQuery(search) ?? (inviteToken ? getInviteEntrySource(inviteToken) : null);
  if (!entrySource || !pathname.includes('/invite/')) return pathname;

  const separator = pathname.includes('?') ? '&' : '?';
  return `${pathname}${separator}${INVITE_ENTRY_SOURCE_QUERY_KEY}=${entrySource}`;
}

function buildInviteGuardianNativeDeepLink(token: string, entrySource: EntrySource): string {
  const encodedToken = encodeURIComponent(token);
  return `daengv2mobile://invite/guardian/${encodedToken}?${INVITE_ENTRY_SOURCE_QUERY_KEY}=${entrySource}`;
}

export {
  appendEntrySourceToInvitePath,
  appendInviteQrEntrySource,
  buildInviteGuardianNativeDeepLink,
  extractInviteTokenFromPath,
  getInviteEntrySource,
  parseEntrySourceFromQuery,
  persistInviteEntrySource,
  resolveEntrySource,
};
