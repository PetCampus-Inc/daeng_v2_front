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
  'media.pickImage': { requestId: string; mediaTypes?: 'images' | 'videos' | 'all'; allowsEditing?: boolean; quality?: number; aspect?: [number, number] };
  'media.pickImage.result': { requestId: string; cancelled: boolean; assets?: Array<{ uri: string; width: number; height: number; fileSize?: number; type?: string; fileName?: string; mimeType?: string }> };
  'media.pickImage.cancel': { requestId: string; reason?: string };
  'media.pickImages': { requestId: string; quality?: number; orderedSelection?: boolean; selectionLimit?: number };
  'media.pickImages.result': { requestId: string; cancelled: boolean; assets?: Array<{ uri: string; width: number; height: number; fileSize?: number; type?: string; fileName?: string; mimeType?: string }> };
  'media.pickImages.cancel': { requestId: string; reason?: string };
}

export type { BridgeEventMap };
