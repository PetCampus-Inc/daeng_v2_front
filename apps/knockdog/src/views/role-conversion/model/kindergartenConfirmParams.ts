import { getCurrentTxId } from '@shared/lib/bridge/useNavigationResult';

import type { RoleConversionKindergartenInfo } from './kindergartenInfo';

const KINDERGARTEN_DRAFT_KEY = 'role_conversion_kindergarten_draft';

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

export { clearDraft, readParams, saveDraft };
