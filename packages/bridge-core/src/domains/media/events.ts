import type { PickImageParams, PickImageResult } from './types';

interface MediaEventMap {
  'media.pickImage': PickImageParams & { requestId: string };

  'media.pickImage.result': { requestId: string } & PickImageResult;

  'media.pickImage.cancel': {
    requestId: string;
    reason?: string;
  };

  'media.pickImage.uploading': {
    requestId: string;
    count: number;
  };
}

export type { MediaEventMap };
