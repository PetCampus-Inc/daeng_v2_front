import { create } from 'zustand';

interface BlockingOverlayStore {
  content: BlockingOverlayContent | null;
  setUploadOverlay: (visible: boolean, message: string) => void;
  showAddressRegistrationDialog: () => Promise<AddressRegistrationDialogAction>;
  resolveAddressRegistrationDialog: (action: AddressRegistrationDialogAction) => void;
}

type BlockingOverlayContent = { kind: 'upload'; message: string } | { kind: 'addressRegistration' };
type AddressRegistrationDialogAction = 'cancel' | 'register';

let addressRegistrationResolver: ((action: AddressRegistrationDialogAction) => void) | null = null;

const useBlockingOverlayStore = create<BlockingOverlayStore>((set, get) => ({
  content: null,
  setUploadOverlay: (visible, message) => set({ content: visible ? { kind: 'upload', message } : null }),
  showAddressRegistrationDialog: () =>
    new Promise<AddressRegistrationDialogAction>((resolve) => {
      addressRegistrationResolver?.('cancel');
      addressRegistrationResolver = resolve;
      set({ content: { kind: 'addressRegistration' } });
    }),
  resolveAddressRegistrationDialog: (action) => {
    if (get().content?.kind !== 'addressRegistration') return;

    addressRegistrationResolver?.(action);
    addressRegistrationResolver = null;
    set({ content: null });
  },
}));

export { useBlockingOverlayStore };
export type { AddressRegistrationDialogAction };
