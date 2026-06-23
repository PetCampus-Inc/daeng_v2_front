import { getCurrentTxId } from '@shared/lib/bridge/useNavigationResult';

import type { RoleConversionKindergartenInfo, SearchPrefill } from './kindergartenInfo';

const KINDERGARTEN_DRAFT_KEY = 'role_conversion_kindergarten_draft';
const SEARCH_PREFILL_KEY = 'role_conversion_search_prefill';

const paramsCache = new Map<string, RoleConversionKindergartenInfo>();

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

    return JSON.parse(raw) as RoleConversionKindergartenInfo;
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

    return JSON.parse(raw) as SearchPrefill;
  } catch {
    return null;
  }
}

let cachedSearchPrefillInit: SearchPrefill | null = null;

function consumeSearchPrefillInit(
  getParams: () => { searchPrefill?: SearchPrefill } | null
): SearchPrefill | null {
  const navPrefill = getParams()?.searchPrefill;

  if (navPrefill) {
    cachedSearchPrefillInit = navPrefill;
    saveSearchPrefill(navPrefill);
    return navPrefill;
  }

  const storedPrefill = loadSearchPrefill();

  if (storedPrefill) {
    cachedSearchPrefillInit = storedPrefill;
    return storedPrefill;
  }

  if (cachedSearchPrefillInit) {
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
    return paramsCache.get(txId)!;
  }

  const navParams = getParams();

  if (navParams?.kindergarten) {
    if (txId) {
      paramsCache.set(txId, navParams.kindergarten);
    }

    return navParams.kindergarten;
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
