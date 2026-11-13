import { METHODS, type ImageAsset } from '@knockdog/bridge-core';

import { postDiaryPhotoUploadUrls, type DiaryPhotoUpload } from '@entities/guardian-diary';
import { ApiError, fetchWithUploadTimeout } from '@shared/api';
import { getBridgeInstance } from '@shared/lib/bridge';
import { getPreviewImage } from '@shared/lib/media';

interface DiaryPickAsset extends ImageAsset {
  uri?: string;
  file?: File;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
}

interface DiaryUploadedPhoto {
  tempKey: string;
  src: string;
}

interface DiaryPhotoUploadResult {
  photos: DiaryUploadedPhoto[];
  rejectedCount: number;
  failedCount: number;
}

interface DiaryPhotoRequest {
  asset: DiaryPickAsset;
  filename: string;
  contentType: 'image/jpeg' | 'image/png';
  size: number;
}

const DIARY_PHOTO_MAX_BYTES = 3 * 1024 * 1024;

function resolveContentType(asset: DiaryPickAsset) {
  const mimeType = (asset.file?.type || asset.mimeType || '').toLowerCase().trim();
  if (mimeType === 'image/jpg' || mimeType === 'image/jpeg') return 'image/jpeg';
  if (mimeType === 'image/png') return 'image/png';

  const extension = (asset.file?.name ?? asset.fileName ?? '').toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  if (extension === 'png') return 'image/png';
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  return null;
}

function resolveFileName(asset: DiaryPickAsset, index: number, contentType: DiaryPhotoRequest['contentType']) {
  const extension = contentType === 'image/png' ? 'png' : 'jpg';
  const raw = (asset.file?.name ?? asset.fileName)?.trim();
  const base = raw?.replace(/\.[^.]+$/, '') || `diary-${Date.now()}-${index}`;
  return `${base}.${extension}`;
}

function buildDiaryPhotoRequest(asset: DiaryPickAsset, index: number): DiaryPhotoRequest | null {
  const contentType = resolveContentType(asset);
  const size = asset.file?.size || asset.fileSize || 0;
  if (!contentType || size <= 0 || size > DIARY_PHOTO_MAX_BYTES) return null;
  return { asset, contentType, size, filename: resolveFileName(asset, index, contentType) };
}

function isPhotoSpecError(error: unknown) {
  return error instanceof ApiError && error.status === 400;
}

async function putDiaryPhoto(asset: DiaryPickAsset, upload: DiaryPhotoUpload, contentType: string) {
  if (asset.file) {
    const response = await fetchWithUploadTimeout(upload.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: asset.file,
    });
    if (!response.ok) throw new Error('사진을 올리지 못했어요.');
    return;
  }

  const uri = asset.uri ?? asset.preSignedUrl;
  const bridge = getBridgeInstance();
  if (!bridge || !uri) throw new Error('업로드할 사진 파일을 찾지 못했어요.');
  await bridge.request(METHODS.putFileToPresignedUrl, { uri, uploadUrl: upload.uploadUrl, contentType });
}

async function resolveUploadedSrc(asset: DiaryPickAsset, tempKey: string) {
  if (asset.file) return asset.uri || asset.preSignedUrl || '';
  const { data } = await getPreviewImage(tempKey);
  return data?.preSignedUrl || asset.uri || '';
}

async function uploadDiaryPhotoFile(request: DiaryPhotoRequest): Promise<DiaryUploadedPhoto> {
  const uploads = await postDiaryPhotoUploadUrls([
    { filename: request.filename, contentType: request.contentType, size: request.size },
  ]);
  const upload = uploads[0];
  if (!upload) throw new Error('사진 업로드 주소를 받지 못했어요.');
  await putDiaryPhoto(request.asset, upload, request.contentType);
  const src = await resolveUploadedSrc(request.asset, upload.tempKey);
  if (!src) throw new Error('사진 미리보기 주소를 받지 못했어요.');
  return { tempKey: upload.tempKey, src };
}

async function uploadDiaryPhotoFiles(assets: DiaryPickAsset[]): Promise<DiaryPhotoUploadResult> {
  const photos: DiaryUploadedPhoto[] = [];
  let rejectedCount = 0;
  let failedCount = 0;
  let firstError: unknown;

  for (const [index, asset] of assets.entries()) {
    const request = buildDiaryPhotoRequest(asset, index);
    if (!request) {
      rejectedCount += 1;
      continue;
    }
    try {
      photos.push(await uploadDiaryPhotoFile(request));
    } catch (error) {
      if (isPhotoSpecError(error)) {
        rejectedCount += 1;
        continue;
      }
      failedCount += 1;
      firstError = firstError ?? error;
    }
  }

  if (photos.length === 0 && firstError) throw firstError;
  return { photos, rejectedCount, failedCount };
}

export { buildDiaryPhotoRequest, uploadDiaryPhotoFiles, DIARY_PHOTO_MAX_BYTES };
export type { DiaryPickAsset, DiaryPhotoUploadResult };
