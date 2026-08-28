import { create } from 'zustand';

interface ConfirmDialogTitlePart {
  text: string;
  accent?: boolean;
}

interface ConfirmDialogOptions {
  title: string;
  /** 있으면 title 대신 이걸 렌더링한다. accent: true인 조각은 강조색으로 표시 */
  titleParts?: ConfirmDialogTitlePart[];
  description?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  /** false면 취소 버튼 없이 확인 버튼 하나만 보여준다 (안내성 알림용). 기본 true */
  showCancelButton?: boolean;
  /** 확인 버튼 색상. 'accent'(주황, 기본) | 'neutral'(진회색, bg-fill-secondary-700) */
  confirmVariant?: 'accent' | 'neutral';
  /** 제목/설명/버튼 영역 좌우 패딩(px). 기본 20 */
  contentPaddingHorizontal?: number;
  /** true면 제목 위에 52px 원형 아바타를 보여준다 (프로필 이미지 없으면 발바닥 아이콘 fallback) */
  showAvatar?: boolean;
  avatarUrl?: string;
}

interface BlockingOverlayStore {
  content: BlockingOverlayContent | null;
  setUploadOverlay: (visible: boolean, message: string) => void;
  showConfirmDialog: (options: ConfirmDialogOptions) => Promise<ConfirmDialogAction>;
  resolveConfirmDialog: (action: ConfirmDialogAction) => void;
}

type BlockingOverlayContent = { kind: 'upload'; message: string } | ({ kind: 'confirm' } & ConfirmDialogOptions);
type ConfirmDialogAction = 'cancel' | 'confirm';

let confirmDialogResolver: ((action: ConfirmDialogAction) => void) | null = null;

const useBlockingOverlayStore = create<BlockingOverlayStore>((set, get) => ({
  content: null,
  setUploadOverlay: (visible, message) => set({ content: visible ? { kind: 'upload', message } : null }),
  showConfirmDialog: (options) =>
    new Promise<ConfirmDialogAction>((resolve) => {
      confirmDialogResolver?.('cancel');
      confirmDialogResolver = resolve;
      set({ content: { kind: 'confirm', ...options } });
    }),
  resolveConfirmDialog: (action) => {
    if (get().content?.kind !== 'confirm') return;

    confirmDialogResolver?.(action);
    confirmDialogResolver = null;
    set({ content: null });
  },
}));

export { useBlockingOverlayStore };
export type { ConfirmDialogAction, ConfirmDialogOptions, ConfirmDialogTitlePart };
