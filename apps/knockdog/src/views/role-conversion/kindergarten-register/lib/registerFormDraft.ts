import {
  emptyRegisterForm,
  type KindergartenRegisterForm,
} from '@views/role-conversion/model/kindergartenInfo';

const REGISTER_FORM_DRAFT_KEY = 'role_conversion_register_form_draft';
const REGISTER_FORM_DRAFT_UPDATED_EVENT = 'role-conversion:register-form-draft-updated';

function notifyRegisterFormDraftUpdated() {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new Event(REGISTER_FORM_DRAFT_UPDATED_EVENT));
}

function isKindergartenRegisterForm(value: unknown): value is KindergartenRegisterForm {
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

function saveRegisterFormDraft(form: KindergartenRegisterForm) {
  if (typeof window === 'undefined') return;

  sessionStorage.setItem(REGISTER_FORM_DRAFT_KEY, JSON.stringify(form));
  notifyRegisterFormDraftUpdated();
}

function loadRegisterFormDraft(): KindergartenRegisterForm | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(REGISTER_FORM_DRAFT_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isKindergartenRegisterForm(parsed)) return null;

    return {
      ...parsed,
      addressDetail: parsed.addressDetail ?? '',
    };
  } catch {
    return null;
  }
}

/** 웹: 주소 페이지(동일 탭 sessionStorage) → 등록 폼 remount 복원용 */
function updateRegisterFormDraftAddress(address: string) {
  const draft = loadRegisterFormDraft();

  saveRegisterFormDraft({
    ...(draft ?? emptyRegisterForm),
    source: 'manual',
    address,
  });
}

function clearRegisterFormDraft() {
  if (typeof window === 'undefined') return;

  sessionStorage.removeItem(REGISTER_FORM_DRAFT_KEY);
}

export {
  clearRegisterFormDraft,
  loadRegisterFormDraft,
  REGISTER_FORM_DRAFT_UPDATED_EVENT,
  saveRegisterFormDraft,
  updateRegisterFormDraftAddress,
};
