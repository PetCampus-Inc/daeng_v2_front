import { METHODS } from '../../rpc';
import type {
  PutFileToPresignedUrlParams,
  PutFileToPresignedUrlResult,
  SaveImageToGalleryParams,
  SaveImageToGalleryResult,
  ShareImageParams,
  ShareImageResult,
} from './types';

interface MediaRPCSchema {
  [METHODS.saveImageToGallery]: {
    params: SaveImageToGalleryParams;
    result: SaveImageToGalleryResult;
  };
  [METHODS.shareImage]: {
    params: ShareImageParams;
    result: ShareImageResult;
  };
  [METHODS.putFileToPresignedUrl]: {
    params: PutFileToPresignedUrlParams;
    result: PutFileToPresignedUrlResult;
  };
}

export type { MediaRPCSchema };
