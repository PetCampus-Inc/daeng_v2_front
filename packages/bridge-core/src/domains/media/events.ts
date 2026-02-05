import type { ImageAsset, PickImageParams } from './types';

interface MediaEventMap {
  'media.pickImage': PickImageParams & { requestId: string };

  'media.pickImage.result': {
    requestId: string;
    cancelled: boolean;
    assets?: ImageAsset[];
  };

  'media.pickImage.cancel': {
    requestId: string;
    reason?: string;
  };
}

export type { MediaEventMap };
