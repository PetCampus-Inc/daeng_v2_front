import { METHODS, type ImageAsset } from '@knockdog/bridge-core';

import {
  postSchoolNews,
  postSchoolNewsImageUploadUrls,
  toCreatedNewsId,
  type SchoolNewsWriteRequest,
} from '@entities/school-news';

import { getBridgeInstance } from '@shared/lib/bridge';

interface NewsImageSource {
  previewUrl: string;
  file?: File;
  uri?: string;
  fileName: string;
  contentType: string;
  size: number;
  tempKey?: string;
}

interface CreateSchoolNewsParams {
  schoolId: number;
  title: string;
  body: string;
  notice: boolean;
  sendNotification: boolean;
  images: NewsImageSource[];
  resolveIdempotencyKey: (payload: SchoolNewsWriteRequest) => string;
}

class NewsImageUploadError extends Error {
  constructor() {
    super('소식 이미지를 업로드하지 못했습니다.');
    this.name = 'NewsImageUploadError';
  }
}

function normalizeContentType(mimeType: string) {
  const lower = mimeType.toLowerCase().trim();
  if (lower === 'image/jpg') return 'image/jpeg';
  return lower || 'image/jpeg';
}

function toNewsImageSource(asset: ImageAsset & { file?: File }, index: number): NewsImageSource {
  const fileName = asset.file?.name?.trim() || asset.fileName?.trim() || `news-${Date.now()}-${index}.jpg`;
  const contentType = normalizeContentType(asset.file?.type || asset.mimeType || 'image/jpeg');
  const size = asset.file?.size || asset.fileSize || 0;
  const previewUrl = asset.uri || asset.preSignedUrl;

  return {
    previewUrl,
    file: asset.file,
    uri: asset.uri || asset.preSignedUrl,
    fileName,
    contentType,
    size,
    tempKey: asset.key || undefined,
  };
}

async function putFileToS3Web(uploadUrl: string, file: File, contentType: string) {
  const { fetchWithUploadTimeout } = await import('@shared/api/lib/fetchWithUploadTimeout');
  const response = await fetchWithUploadTimeout(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  });

  if (!response.ok) throw new NewsImageUploadError();
}

async function putFileToS3Native(uri: string, uploadUrl: string, contentType: string) {
  const bridge = getBridgeInstance();
  if (!bridge) throw new NewsImageUploadError();

  await bridge.request(METHODS.putFileToPresignedUrl, {
    uri,
    uploadUrl,
    contentType,
  });
}

async function uploadPendingNewsImages(schoolId: number, images: NewsImageSource[]) {
  const pending = images.filter((image) => !image.tempKey);
  if (pending.length === 0) return;

  const hasUnreadable = pending.some((image) => image.size <= 0 || (!image.file && !image.uri));
  if (hasUnreadable) throw new NewsImageUploadError();

  let targets: { tempKey?: string | null; uploadUrl?: string | null }[] = [];
  try {
    const response = await postSchoolNewsImageUploadUrls(
      schoolId,
      pending.map((image) => ({
        filename: image.fileName,
        contentType: image.contentType,
        size: image.size,
      }))
    );
    targets = response.data?.items ?? [];
  } catch {
    throw new NewsImageUploadError();
  }

  if (targets.length !== pending.length) throw new NewsImageUploadError();

  for (let index = 0; index < pending.length; index += 1) {
    const image = pending[index];
    const target = targets[index];
    if (!image || !target?.tempKey || !target.uploadUrl) throw new NewsImageUploadError();

    try {
      if (image.file) {
        await putFileToS3Web(target.uploadUrl, image.file, image.contentType);
      } else if (image.uri) {
        await putFileToS3Native(image.uri, target.uploadUrl, image.contentType);
      } else {
        throw new NewsImageUploadError();
      }
    } catch (error) {
      if (error instanceof NewsImageUploadError) throw error;
      throw new NewsImageUploadError();
    }

    image.tempKey = target.tempKey;
  }
}

async function createSchoolNews({
  schoolId,
  title,
  body,
  notice,
  sendNotification,
  images,
  resolveIdempotencyKey,
}: CreateSchoolNewsParams) {
  await uploadPendingNewsImages(schoolId, images);

  const payload: SchoolNewsWriteRequest = {
    title,
    body,
    notice,
    sendNotification,
    images: images.map((image) => ({
      tempKey: image.tempKey ?? '',
      originalFilename: image.fileName,
    })),
  };

  if (payload.images.some((image) => !image.tempKey)) throw new NewsImageUploadError();

  const response = await postSchoolNews({
    schoolId,
    idempotencyKey: resolveIdempotencyKey(payload),
    body: payload,
  });
  const newsId = toCreatedNewsId(response.data);
  if (!newsId) throw new Error('소식 id가 없습니다.');

  return { newsId, payload };
}

export { createSchoolNews, NewsImageUploadError, toNewsImageSource };
export type { NewsImageSource };
