interface ToastEventMap {
  'ui.toast': {
    id?: string;
    title?: string;
    description?: string;
    duration?: number;
    variant?: 'rounded' | 'square';
    position?: 'top' | 'bottom' | 'bottom-above-nav';
  };
}

export type { ToastEventMap };
