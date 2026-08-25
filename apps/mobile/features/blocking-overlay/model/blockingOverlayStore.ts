import { create } from 'zustand';

interface BlockingOverlayStore {
  content: { kind: 'upload'; message: string } | null;
  setUploadOverlay: (visible: boolean, message: string) => void;
}

const useBlockingOverlayStore = create<BlockingOverlayStore>((set) => ({
  content: null,
  setUploadOverlay: (visible, message) => set({ content: visible ? { kind: 'upload', message } : null }),
}));

export { useBlockingOverlayStore };
