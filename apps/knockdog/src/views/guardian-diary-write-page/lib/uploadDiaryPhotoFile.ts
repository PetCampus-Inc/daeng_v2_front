import { METHODS, type ImageAsset } from '@knockdog/bridge-core';

import { postDiaryPhotoUploadUrls, type DiaryPhotoUpload } from '@entities/guardian-diary';
import { fetchWithUploadTimeout } from '@shared/api';
import { getBridgeInstance } from '@shared/lib/bridge';

interface DiaryPickAsset extends ImageAsset {
  uri?: string;
  file?: File;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
}

function resolveContentType(asset: DiaryPickAsset) {
  const mimeType = (asset.file?.type || asset.mimeType || '').toLowerCase().trim();
  if (mimeType === 'image/jpg') return 'image/jpeg';
  if (mimeType === 'image/png' || mimeType === 'image/jpeg') return mimeType;
  const extension = (asset.file?.name ?? asset.fileName ?? '').toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  if (extension === 'png') return 'image/png';
  return 'image/jpeg';
}

function resolveFileName(asset: DiaryPickAsset, index: number) {
  const name = (asset.file?.name ?? asset.fileName)?.trim();
  return name || `diary-${Date.now()}-${index}.jpg`;
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

async function uploadDiaryPhotoFiles(assets: DiaryPickAsset[]) {
  const files = assets.map((asset, index) => {
    const size = asset.file?.size || asset.fileSize || 0;
    return {
      filename: resolveFileName(asset, index),
      contentType: resolveContentType(asset),
      ...(size > 0 ? { size } : {}),
    };
  });
  const uploads = await postDiaryPhotoUploadUrls(files);
  if (uploads.length !== assets.length) throw new Error('사진 업로드 주소를 받지 못했어요.');

  await Promise.all(
    assets.map((asset, index) => {
      const upload = uploads[index];
      const file = files[index];
      if (!upload || !file) throw new Error('사진 업로드 주소를 받지 못했어요.');
      return putDiaryPhoto(asset, upload, file.contentType);
    })
  );
  return uploads;
}

export { uploadDiaryPhotoFiles };
export type { DiaryPickAsset };
