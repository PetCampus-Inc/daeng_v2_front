export const GA_MEASUREMENT_ID = 'G-3XK1LPFE9J';

type GTagEvent = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: string | number | undefined;
};

declare global {
  interface Window {
    gtag: (command: string, ...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export const pageview = (url: string, title?: string) => {
  if (typeof window.gtag === 'undefined') return;
  window.gtag('event', 'page_view', {
    page_path: url,
    page_location: typeof window !== 'undefined' ? window.location.href : undefined,
    ...(title ? { page_title: title } : {}),
  });
};

export const event = ({ action, category, label, value, ...rest }: GTagEvent) => {
  if (typeof window.gtag === 'undefined') return;
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
    ...rest,
  });
};
