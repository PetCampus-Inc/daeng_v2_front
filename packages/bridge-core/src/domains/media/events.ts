import type { ImageAsset, PickImageParams, PickImageSkipSummary, PickImageFailureReason } from './types';

interface MediaEventMap {
  'media.pickImage': PickImageParams & { requestId: string };

  'media.pickImage.result': {
    requestId: string;
    cancelled: boolean;
    assets?: ImageAsset[];
    skipped?: PickImageSkipSummary;
    failure?: PickImageFailureReason;
    exceededLimit?: boolean;
  };

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
