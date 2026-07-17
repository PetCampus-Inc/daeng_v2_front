import { getCurrentTxId } from '@shared/lib/bridge/useNavigationResult';

import type { RoleConversionKindergartenInfo, SearchPrefill } from '@views/role-conversion/model/kindergartenInfo';

const KINDERGARTEN_DRAFT_KEY = 'role_conversion_kindergarten_draft';
const SEARCH_PREFILL_KEY = 'role_conversion_search_prefill';

const paramsCache = new Map<string, RoleConversionKindergartenInfo>();

function isSearchPrefill(value: unknown): value is SearchPrefill {
  if (!value || typeof value !== 'object') return false;

  const record = value as Record<string, unknown>;

  return (
    typeof record.placeId === 'string' &&
    typeof record.name === 'string' &&
    typeof record.address === 'string' &&
    typeof record.kindergartenNumber === 'string'
  );
}

function isKindergartenInfo(value: unknown): value is RoleConversionKindergartenInfo {
  if (!value || typeof value !== 'object') return false;

  const record = value as Record<string, unknown>;

  return (
    (record.source === 'manual' || record.source === 'search') &&
    (record.placeId === undefined || typeof record.placeId === 'string') &&
    typeof record.name === 'string' &&
    typeof record.address === 'string' &&
    (record.addressDetail === undefined || typeof record.addressDetail === 'string') &&
    typeof record.kindergartenNumber === 'string' &&
    typeof record.ownerName === 'string' &&
    typeof record.phoneNumber === 'string'
  );
}

function normalizeKindergartenInfo(
  info: RoleConversionKindergartenInfo
): RoleConversionKindergartenInfo {
  return {
    ...info,
    addressDetail: info.addressDetail ?? '',
  };
}

function saveDraft(info: RoleConversionKindergartenInfo) {
  if (typeof window === 'undefined') return;

  sessionStorage.setItem(KINDERGARTEN_DRAFT_KEY, JSON.stringify(info));
}

function clearDraft() {
  if (typeof window === 'undefined') return;

  sessionStorage.removeItem(KINDERGARTEN_DRAFT_KEY);
}

function loadDraft(): RoleConversionKindergartenInfo | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(KINDERGARTEN_DRAFT_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    return isKindergartenInfo(parsed) ? normalizeKindergartenInfo(parsed) : null;
  } catch {
    return null;
  }
}

function saveSearchPrefill(prefill: SearchPrefill) {
  if (typeof window === 'undefined') return;

  cachedSearchPrefillInit = prefill;
  sessionStorage.setItem(SEARCH_PREFILL_KEY, JSON.stringify(prefill));
}

function loadSearchPrefill(): SearchPrefill | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(SEARCH_PREFILL_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    return isSearchPrefill(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

let cachedSearchPrefillInit: SearchPrefill | null = null;

function consumeSearchPrefillInit(
  getParams: () => { searchPrefill?: SearchPrefill } | null
): SearchPrefill | null {
  const navPrefill = getParams()?.searchPrefill;

  if (navPrefill && isSearchPrefill(navPrefill)) {
    cachedSearchPrefillInit = navPrefill;
    saveSearchPrefill(navPrefill);
    return navPrefill;
  }

  const storedPrefill = loadSearchPrefill();

  if (storedPrefill) {
    cachedSearchPrefillInit = storedPrefill;
    return storedPrefill;
  }

  if (cachedSearchPrefillInit && isSearchPrefill(cachedSearchPrefillInit)) {
    return cachedSearchPrefillInit;
  }

  return null;
}

/** 네이티브 history.state._params의 searchPrefill만 읽음 (sessionStorage fallback 없음) */
function readNavSearchPrefill(
  getParams: () => { searchPrefill?: SearchPrefill } | null
): SearchPrefill | null {
  const navPrefill = getParams()?.searchPrefill;
  return navPrefill && isSearchPrefill(navPrefill) ? navPrefill : null;
}

function clearSearchPrefill() {
  if (typeof window === 'undefined') return;

  cachedSearchPrefillInit = null;
  sessionStorage.removeItem(SEARCH_PREFILL_KEY);
}

function readParams(
  getParams: () => { kindergarten?: RoleConversionKindergartenInfo } | null
): RoleConversionKindergartenInfo | null {
  if (typeof window === 'undefined') return null;

  const txId = getCurrentTxId();

  if (txId && paramsCache.has(txId)) {
    const cached = paramsCache.get(txId);
    if (cached && isKindergartenInfo(cached)) {
      return normalizeKindergartenInfo(cached);
    }
  }

  const navParams = getParams();
  const kindergarten = navParams?.kindergarten;

  if (kindergarten && isKindergartenInfo(kindergarten)) {
    const normalized = normalizeKindergartenInfo(kindergarten);
    if (txId) {
      paramsCache.set(txId, normalized);
    }

    return normalized;
  }

  return loadDraft();
}

export {
  clearDraft,
  clearSearchPrefill,
  consumeSearchPrefillInit,
  loadSearchPrefill,
  readNavSearchPrefill,
  readParams,
  saveDraft,
  saveSearchPrefill,
};
