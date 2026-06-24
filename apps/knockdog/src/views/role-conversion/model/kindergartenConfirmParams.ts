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
    typeof record.kindergartenNumber === 'string' &&
    typeof record.ownerName === 'string' &&
    typeof record.phoneNumber === 'string'
  );
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
    return isKindergartenInfo(parsed) ? parsed : null;
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
      return cached;
    }
  }

  const navParams = getParams();
  const kindergarten = navParams?.kindergarten;

  if (kindergarten && isKindergartenInfo(kindergarten)) {
    if (txId) {
      paramsCache.set(txId, kindergarten);
    }

    return kindergarten;
  }

  return loadDraft();
}

export {
  clearDraft,
  clearSearchPrefill,
  consumeSearchPrefillInit,
  loadSearchPrefill,
  readParams,
  saveDraft,
  saveSearchPrefill,
};
