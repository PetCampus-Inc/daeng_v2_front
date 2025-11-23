import type { ImageAsset } from './methods';

interface BridgeEventMap {
  'bridge.ready': { nativeVersion: string; methods: string[] };
  'nav.result': { txId: string; result: unknown };
  'nav.cancel': { txId: string; reason?: string };
  'ui.toast': {
    id?: string;
    title?: string;
    description?: string;
    duration?: number;
    variant?: 'rounded' | 'square';
    position?: 'top' | 'bottom' | 'bottom-above-nav';
  };
  'media.pickImage': {
    requestId: string;
    mediaTypes?: 'images' | 'videos' | 'all';
    allowsEditing?: boolean;
    quality?: number;
    aspect?: [number, number];
    allowsMultipleSelection?: boolean;
    orderedSelection?: boolean;
    selectionLimit?: number;
  };
  'media.pickImage.result': {
    requestId: string;
    cancelled: boolean;
    assets?: ImageAsset[];
  };
  'media.pickImage.cancel': { requestId: string; reason?: string };
  'system.openExternalLink': { url: string };
}

export type { BridgeEventMap };
