import { METHODS } from '../../rpc';
import type { SaveImageToGalleryParams, SaveImageToGalleryResult } from './types';

interface MediaRPCSchema {
  [METHODS.saveImageToGallery]: {
    params: SaveImageToGalleryParams;
    result: SaveImageToGalleryResult;
  };
}

export type { MediaRPCSchema };
