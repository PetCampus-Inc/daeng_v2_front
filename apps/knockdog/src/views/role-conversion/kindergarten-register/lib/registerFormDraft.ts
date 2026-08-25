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

/**
 * Stack WebView마다 sessionStorage가 분리되므로 localStorage 사용
 * (확인 페이지 "아니요" → 등록 복귀 시 대표자명/전화 유지)
 */
function saveRegisterFormDraft(form: KindergartenRegisterForm) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(REGISTER_FORM_DRAFT_KEY, JSON.stringify(form));
  // 이전 sessionStorage draft 제거
  sessionStorage.removeItem(REGISTER_FORM_DRAFT_KEY);
  notifyRegisterFormDraftUpdated();
}

function loadRegisterFormDraft(): KindergartenRegisterForm | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw =
      localStorage.getItem(REGISTER_FORM_DRAFT_KEY) ?? sessionStorage.getItem(REGISTER_FORM_DRAFT_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isKindergartenRegisterForm(parsed)) return null;

    const form = {
      ...parsed,
      addressDetail: parsed.addressDetail ?? '',
    };

    // sessionStorage에만 있으면 localStorage로 이관
    if (!localStorage.getItem(REGISTER_FORM_DRAFT_KEY)) {
      localStorage.setItem(REGISTER_FORM_DRAFT_KEY, JSON.stringify(form));
      sessionStorage.removeItem(REGISTER_FORM_DRAFT_KEY);
    }

    return form;
  } catch {
    return null;
  }
}

/** 웹: 주소 페이지(동일 탭) → 등록 폼 remount 복원용 */
function updateRegisterFormDraftAddress(address: string) {
  const draft = loadRegisterFormDraft();

  saveRegisterFormDraft({
    ...(draft ?? emptyRegisterForm),
    address,
    addressDetail: '',
  });
}

function clearRegisterFormDraft() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(REGISTER_FORM_DRAFT_KEY);
  sessionStorage.removeItem(REGISTER_FORM_DRAFT_KEY);
}

export {
  clearRegisterFormDraft,
  isKindergartenRegisterForm,
  loadRegisterFormDraft,
  REGISTER_FORM_DRAFT_UPDATED_EVENT,
  saveRegisterFormDraft,
  updateRegisterFormDraftAddress,
};
