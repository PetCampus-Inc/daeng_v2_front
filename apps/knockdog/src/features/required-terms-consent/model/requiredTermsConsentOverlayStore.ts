import { create } from 'zustand';

interface RequiredTermsConsentOverlayStore {
  isBlockingOverlayOpen: boolean;
  setBlockingOverlayOpen: (isOpen: boolean) => void;
}

const useRequiredTermsConsentOverlayStore = create<RequiredTermsConsentOverlayStore>((set) => ({
  isBlockingOverlayOpen: false,
  setBlockingOverlayOpen: (isOpen) => set({ isBlockingOverlayOpen: isOpen }),
}));

export { useRequiredTermsConsentOverlayStore };
