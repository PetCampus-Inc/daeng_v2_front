const SELECTED_ADDRESS_KEY = 'owner_kindergarten_edit_selected_address';
const SELECTED_ADDRESS_EVENT = 'owner-kindergarten-edit:address-selected';

function notifySelectedAddressUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(SELECTED_ADDRESS_EVENT));
}

function saveSelectedAddress(address: string) {
  if (typeof window === 'undefined') return;

  sessionStorage.setItem(SELECTED_ADDRESS_KEY, JSON.stringify(address));
  notifySelectedAddressUpdated();
}

function consumeSelectedAddress(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(SELECTED_ADDRESS_KEY);
    if (!raw) return null;

    sessionStorage.removeItem(SELECTED_ADDRESS_KEY);
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === 'string' && parsed.length > 0 ? parsed : null;
  } catch {
    sessionStorage.removeItem(SELECTED_ADDRESS_KEY);
    return null;
  }
}

export {
  SELECTED_ADDRESS_EVENT,
  consumeSelectedAddress,
  saveSelectedAddress,
};
