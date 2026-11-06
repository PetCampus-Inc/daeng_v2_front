import { METHODS, type ImageAsset } from '@knockdog/bridge-core';

import { postSchoolReviewImageUploadUrls, type SchoolReviewImageWrite } from '@entities/review';
import { getBridgeInstance } from '@shared/lib/bridge';

interface ReviewPhotoSource {
  id: string;
  url: string;
  imageId?: number;
  file?: File;
  uri?: string;
  fileName: string;
  contentType: string;
  size: number;
}

interface PickedReviewAsset extends ImageAsset {
  file?: File;
}

function uploadFailed(): never {
  throw new Error('리뷰 사진을 업로드하지 못했습니다.');
}

function normalizeContentType(mimeType: string) {
  const lower = mimeType.toLowerCase().trim();
  if (lower === 'image/jpg') return 'image/jpeg';
  return lower || 'image/jpeg';
}

function resolveContentType(asset: PickedReviewAsset, fileName: string) {
  if (asset.file?.type) return normalizeContentType(asset.file.type);
  if (asset.mimeType) return normalizeContentType(asset.mimeType);

  const extension = fileName.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  if (extension === 'png') return 'image/png';
  if (extension === 'heic') return 'image/heic';
  if (extension === 'heif') return 'image/heif';
  return 'image/jpeg';
}

function toLocalReviewPhoto(asset: PickedReviewAsset, index: number): ReviewPhotoSource | null {
  const url = asset.preSignedUrl || asset.uri;
  const file = asset.file;
  const uri = asset.uri || (!file ? asset.preSignedUrl : undefined);
  if (!url || (!file && !uri)) return null;

  const fileName = file?.name?.trim() || asset.fileName?.trim() || `review-${Date.now()}-${index}.jpg`;
  const size = file?.size || asset.fileSize || 0;
  if (size <= 0) return null;

  return {
    id: `local-${fileName}-${index}-${size}`,
    url,
    file,
    uri,
    fileName,
    contentType: resolveContentType(asset, fileName),
    size,
  };
}

async function putFileToS3Web(uploadUrl: string, file: File, contentType: string) {
  const { fetchWithUploadTimeout } = await import('@shared/api/lib/fetchWithUploadTimeout');
  const response = await fetchWithUploadTimeout(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  });

  if (!response.ok) uploadFailed();
}

async function putFileToS3Native(uri: string, uploadUrl: string, contentType: string) {
  const bridge = getBridgeInstance();
  if (!bridge) uploadFailed();

  await bridge.request(METHODS.putFileToPresignedUrl, {
    uri,
    uploadUrl,
    contentType,
  });
}

function isKeptReviewPhoto(photo: ReviewPhotoSource): photo is ReviewPhotoSource & { imageId: number } {
  return typeof photo.imageId === 'number';
}

function toUploadTarget(item: { tempKey?: string | null; uploadUrl?: string | null } | null | undefined) {
  const tempKey = item?.tempKey?.trim() ?? '';
  const uploadUrl = item?.uploadUrl?.trim() ?? '';
  return tempKey && uploadUrl ? { tempKey, uploadUrl } : null;
}

async function resolveSchoolReviewImages(schoolId: number, photos: ReviewPhotoSource[]) {
  const pending = photos.flatMap((photo, index) => (isKeptReviewPhoto(photo) ? [] : [{ photo, index }]));
  const uploaded = new Map<number, SchoolReviewImageWrite>();

  if (pending.length > 0) {
    if (pending.some(({ photo }) => photo.size <= 0 || (!photo.file && !photo.uri))) uploadFailed();

    const response = await postSchoolReviewImageUploadUrls(
      schoolId,
      pending.map(({ photo }) => ({
        filename: photo.fileName,
        contentType: photo.contentType,
        size: photo.size,
      }))
    ).catch(() => uploadFailed());
    const targets = (response.data?.items ?? []).flatMap((item) => {
      const target = toUploadTarget(item);
      return target ? [target] : [];
    });
    if (targets.length !== pending.length) uploadFailed();

    for (let index = 0; index < pending.length; index += 1) {
      const item = pending[index];
      const target = targets[index];
      if (!item || !target) uploadFailed();

      try {
        if (item.photo.file) {
          await putFileToS3Web(target.uploadUrl, item.photo.file, item.photo.contentType);
        } else if (item.photo.uri) {
          await putFileToS3Native(item.photo.uri, target.uploadUrl, item.photo.contentType);
        } else {
          uploadFailed();
        }
      } catch {
        uploadFailed();
      }

      uploaded.set(item.index, {
        tempKey: target.tempKey,
        originalFilename: item.photo.fileName.slice(0, 255),
      });
    }
  }

  return photos.map((photo, index) => {
    if (isKeptReviewPhoto(photo)) return { imageId: photo.imageId };
    return uploaded.get(index) ?? uploadFailed();
  });
}

export { resolveSchoolReviewImages, toLocalReviewPhoto };
export type { ReviewPhotoSource };
