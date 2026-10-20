import { METHODS, type ImageAsset } from '@knockdog/bridge-core';

import { INQUIRY_ERROR_CODE, postInquiryImageUploadUrls, type InquiryUploadFileRequestDto } from '@entities/inquiry';
import { ApiError, fetchWithUploadTimeout } from '@shared/api';
import { getBridgeInstance } from '@shared/lib/bridge';
import { getPreviewImage } from '@shared/lib/media';

interface InquiryPickAsset extends ImageAsset {
  file?: File;
}

/** 업로드를 마친 문의 사진. 등록 API에는 tempKey와 originalFilename을 보낸다 */
interface InquiryPhoto {
  tempKey: string;
  originalFilename: string;
  previewUrl: string;
}

interface InquiryPhotoUploadResult {
  uploaded: InquiryPhoto[];
  failedCount: number;
  /** 실패한 사진 중 서버가 형식·용량 위반으로 거절한 장수 */
  invalidSpecCount: number;
}

function resolveContentType(asset: InquiryPickAsset) {
  const mimeType = (asset.file?.type || asset.mimeType || '').toLowerCase().trim();
  if (mimeType === 'image/jpg') return 'image/jpeg';
  if (mimeType) return mimeType;

  const extension = (asset.file?.name ?? asset.fileName ?? '').toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  if (extension === 'png') return 'image/png';
  if (extension === 'heic') return 'image/heic';
  if (extension === 'heif') return 'image/heif';
  return 'image/jpeg';
}

function resolveFileName(asset: InquiryPickAsset, index: number) {
  const name = (asset.file?.name ?? asset.fileName)?.trim();
  return name || `inquiry-${Date.now()}-${index}.jpg`;
}

function resolveFileSize(asset: InquiryPickAsset) {
  return asset.file?.size || asset.fileSize || 0;
}

/** 발급받은 업로드 URL로 파일을 PUT. 웹은 File, 앱은 네이티브 로컬 파일 URI */
async function putToUploadUrl(asset: InquiryPickAsset, uploadUrl: string, contentType: string) {
  if (asset.file) {
    // 발급 요청에 선언한 contentType과 같아야 서버 검증을 통과한다
    const response = await fetchWithUploadTimeout(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: asset.file,
    });
    if (!response.ok) throw new Error(`사진 업로드 실패: ${response.status}`);
    return;
  }

  const bridge = getBridgeInstance();
  const uri = asset.uri ?? asset.preSignedUrl;
  if (!bridge || !uri) throw new Error('업로드할 사진 파일을 찾지 못했어요.');

  await bridge.request(METHODS.putFileToPresignedUrl, { uri, uploadUrl, contentType });
}

/**
 * 썸네일 주소. 웹은 고른 파일의 blob: 주소를 그대로 쓴다.
 * 앱은 고른 사진이 file:// 경로라 WebView가 불러오지 못하므로, 올린 사진의 조회용 주소를 받아 쓴다
 */
async function resolvePreviewUrl(asset: InquiryPickAsset, tempKey: string) {
  if (asset.file) return asset.preSignedUrl || asset.uri || '';

  const { data } = await getPreviewImage(tempKey);
  if (!data?.preSignedUrl) throw new Error('사진 미리보기 주소를 받지 못했어요.');
  return data.preSignedUrl;
}

/**
 * 사진 한 장을 올린다 (업로드 URL 발급 → PUT → 썸네일 주소).
 * 형식·용량이 맞지 않으면 발급 단계에서 ApiError(INQUIRY_ERROR_CODE.INVALID_IMAGE_SPEC)가 난다
 */
async function uploadInquiryPhoto(asset: InquiryPickAsset, index: number): Promise<InquiryPhoto> {
  const contentType = resolveContentType(asset);
  const filename = resolveFileName(asset, index);
  const size = resolveFileSize(asset);
  if (size <= 0) throw new Error('파일 크기를 확인할 수 없는 사진이 있어요.');

  const file: InquiryUploadFileRequestDto = { filename, contentType, size };
  const { data } = await postInquiryImageUploadUrls([file]);
  const target = data?.items?.[0];
  if (!target) throw new Error('사진 업로드 URL을 받지 못했어요.');

  await putToUploadUrl(asset, target.uploadUrl, contentType);
  return {
    tempKey: target.tempKey,
    originalFilename: filename,
    previewUrl: await resolvePreviewUrl(asset, target.tempKey),
  };
}

function isInvalidSpecError(reason: unknown) {
  return reason instanceof ApiError && reason.code === INQUIRY_ERROR_CODE.INVALID_IMAGE_SPEC;
}

/**
 * 고른 사진을 한 장씩 따로 올린다. 일부가 실패해도 성공한 사진은 고른 순서대로 돌려주고,
 * 실패한 장수와 그중 형식·용량 위반 장수를 함께 돌려준다
 */
async function uploadInquiryPhotos(assets: InquiryPickAsset[]): Promise<InquiryPhotoUploadResult> {
  const results = await Promise.allSettled(assets.map(uploadInquiryPhoto));

  const uploaded = results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
  const invalidSpecCount = results.filter(
    (result) => result.status === 'rejected' && isInvalidSpecError(result.reason)
  ).length;
  return { uploaded, failedCount: results.length - uploaded.length, invalidSpecCount };
}

export { uploadInquiryPhotos };
export type { InquiryPhoto, InquiryPickAsset };
