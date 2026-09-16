import { STORAGE_KEYS } from '@shared/constants';
import { TypedStorage } from '@shared/lib/storage';

import type { EntrySource, InviteEntrySource, InviteOpenMethod } from './gaEvents';

const INVITE_ENTRY_SOURCE_QUERY_KEY = 'entry_source';
/** 동일 초대 URL에서 link/QR 구분용 (`src=link` | `src=qr`) */
const INVITE_SRC_QUERY_KEY = 'src';
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

function parseEntrySourceFromSrcQuery(params: URLSearchParams): InviteEntrySource | null {
  const src = params.get(INVITE_SRC_QUERY_KEY);
  if (src === 'qr') return 'invite_qr';
  if (src === 'link') return 'invite_link';
  return null;
}

function parseEntrySourceFromQuery(search: string | URLSearchParams | null | undefined): EntrySource | null {
  const params = search instanceof URLSearchParams ? search : new URLSearchParams(search ?? '');
  const fromSrc = parseEntrySourceFromSrcQuery(params);
  if (fromSrc) return fromSrc;

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

function getInviteEntrySource(token?: string | null): InviteEntrySource {
  const resolvedToken =
    token ??
    (typeof window !== 'undefined' ? extractInviteTokenFromPath(window.location.pathname) : null);

  if (!resolvedToken) return 'invite_link';

  const stored = readInviteEntrySourceMap()[resolvedToken];
  return stored === 'invite_qr' ? 'invite_qr' : 'invite_link';
}

function toInviteOpenMethod(entrySource: InviteEntrySource): InviteOpenMethod {
  return entrySource === 'invite_qr' ? 'qr' : 'link';
}

function persistInviteEntrySource(search?: string | URLSearchParams | null, token?: string | null) {
  const resolvedToken =
    token ??
    (typeof window !== 'undefined' ? extractInviteTokenFromPath(window.location.pathname) : null);

  if (!resolvedToken) return;

  const fromQuery = parseEntrySourceFromQuery(search);
  if (fromQuery === 'invite_qr' || fromQuery === 'invite_link') {
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

function setInviteEntrySourceParams(url: string, entrySource: InviteEntrySource): string {
  const src = entrySource === 'invite_qr' ? 'qr' : 'link';

  try {
    const parsed = new URL(url);
    parsed.searchParams.set(INVITE_SRC_QUERY_KEY, src);
    parsed.searchParams.set(INVITE_ENTRY_SOURCE_QUERY_KEY, entrySource);
    return parsed.toString();
  } catch {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${INVITE_SRC_QUERY_KEY}=${src}&${INVITE_ENTRY_SOURCE_QUERY_KEY}=${entrySource}`;
  }
}

function appendInviteQrEntrySource(url: string): string {
  return setInviteEntrySourceParams(url, 'invite_qr');
}

function appendInviteLinkEntrySource(url: string): string {
  return setInviteEntrySourceParams(url, 'invite_link');
}

function appendEntrySourceToInvitePath(pathname: string, search?: string | URLSearchParams | null): string {
  const inviteToken = extractInviteTokenFromPath(pathname.split('?')[0] ?? pathname);
  const entrySource = parseEntrySourceFromQuery(search) ?? (inviteToken ? getInviteEntrySource(inviteToken) : null);
  if (!entrySource || entrySource === 'organic' || !pathname.includes('/invite/')) return pathname;

  const src = entrySource === 'invite_qr' ? 'qr' : 'link';
  const hasQuery = pathname.includes('?');
  const params = new URLSearchParams(hasQuery ? pathname.split('?')[1] : '');
  params.set(INVITE_SRC_QUERY_KEY, src);
  params.set(INVITE_ENTRY_SOURCE_QUERY_KEY, entrySource);
  const basePath = pathname.split('?')[0] ?? pathname;
  return `${basePath}?${params.toString()}`;
}

function buildInviteGuardianNativeDeepLink(token: string, entrySource: EntrySource): string {
  const encodedToken = encodeURIComponent(token);
  const inviteEntrySource: InviteEntrySource = entrySource === 'invite_qr' ? 'invite_qr' : 'invite_link';
  const src = inviteEntrySource === 'invite_qr' ? 'qr' : 'link';
  return `daengv2mobile://invite/guardian/${encodedToken}?${INVITE_SRC_QUERY_KEY}=${src}&${INVITE_ENTRY_SOURCE_QUERY_KEY}=${inviteEntrySource}`;
}

export {
  appendEntrySourceToInvitePath,
  appendInviteLinkEntrySource,
  appendInviteQrEntrySource,
  buildInviteGuardianNativeDeepLink,
  extractInviteTokenFromPath,
  getInviteEntrySource,
  parseEntrySourceFromQuery,
  persistInviteEntrySource,
  resolveEntrySource,
  toInviteOpenMethod,
};
