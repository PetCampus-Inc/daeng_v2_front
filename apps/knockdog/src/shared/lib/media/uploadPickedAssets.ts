import { METHODS } from '@knockdog/bridge-core';

import { fetchWithUploadTimeout } from '@shared/api';
import { getBridgeInstance } from '@shared/lib/bridge';

import { getPreviewImage } from './api/getPreviewImage';
import { getUploadImage } from './api/getUploadImage';
import type { WebImageAsset } from './useImagePicker';

const PICKED_UPLOAD_FAIL = '사진을 올리지 못했어요. 잠시 후 다시 시도해주세요';

interface UploadPickedAssetsResult {
  uploaded: WebImageAsset[];
  failedCount: number;
}

function resolveContentType(asset: WebImageAsset) {
  const mimeType = (asset.file?.type || asset.mimeType || '').toLowerCase().trim();
  if (mimeType === 'image/jpg' || mimeType === 'image/jpeg') return 'image/jpeg';
  if (mimeType === 'image/png') return 'image/png';
  return 'image/jpeg';
}

async function putPickedFile(asset: WebImageAsset, uploadUrl: string, contentType: string) {
  if (asset.file) {
    const response = await fetchWithUploadTimeout(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: asset.file,
    });
    if (!response.ok) throw new Error(PICKED_UPLOAD_FAIL);
    return;
  }

  const uri = asset.uri || asset.preSignedUrl;
  const bridge = getBridgeInstance();
  if (!bridge || !uri) throw new Error('업로드할 사진 파일을 찾지 못했어요.');
  await bridge.request(METHODS.putFileToPresignedUrl, { uri, uploadUrl, contentType });
}

async function uploadPickedAsset(asset: WebImageAsset): Promise<WebImageAsset> {
  if (asset.key?.trim()) return asset;

  const contentType = resolveContentType(asset);
  const upload = await getUploadImage();
  await putPickedFile(asset, upload.preSignedUrl, contentType);

  const preview = await getPreviewImage(upload.key);
  const previewUrl = preview.data?.preSignedUrl;
  const displayUri = asset.file ? asset.uri || previewUrl || '' : previewUrl || '';
  if (!displayUri) throw new Error(PICKED_UPLOAD_FAIL);

  return {
    ...asset,
    key: upload.key,
    preSignedUrl: previewUrl || upload.preSignedUrl,
    uri: displayUri,
    mimeType: contentType,
  };
}

/** 앱이 고른 로컬 파일을 웹뷰 인증으로 올린다. 네이티브 업로드는 토큰이 없다. */
async function uploadPickedAssets(assets: WebImageAsset[]): Promise<UploadPickedAssetsResult> {
  const uploaded: WebImageAsset[] = [];
  let failedCount = 0;

  for (const asset of assets) {
    try {
      uploaded.push(await uploadPickedAsset(asset));
    } catch {
      failedCount += 1;
    }
  }

  if (uploaded.length === 0 && failedCount > 0) throw new Error(PICKED_UPLOAD_FAIL);
  return { uploaded, failedCount };
}

export { uploadPickedAssets, PICKED_UPLOAD_FAIL };
export type { UploadPickedAssetsResult };
