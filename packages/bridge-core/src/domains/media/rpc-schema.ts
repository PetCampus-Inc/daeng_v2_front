import { METHODS } from '../../rpc';
import type {
  PutFileToPresignedUrlParams,
  PutFileToPresignedUrlResult,
  SaveImageToGalleryParams,
  SaveImageToGalleryResult,
} from './types';

interface MediaRPCSchema {
  [METHODS.saveImageToGallery]: {
    params: SaveImageToGalleryParams;
    result: SaveImageToGalleryResult;
  };
  [METHODS.putFileToPresignedUrl]: {
    params: PutFileToPresignedUrlParams;
    result: PutFileToPresignedUrlResult;
  };
}

export type { MediaRPCSchema };
