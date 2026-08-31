import {
  mapAlbumPhotoDto,
  postAlbumPhotosCommit,
  postAlbumUploadUrls,
  type AlbumCommitItemRequest,
  type AlbumUploadFileRequest,
  type MappedAlbumPhoto,
} from '@entities/owner-album';

import { METHODS, type ImageAsset } from '@knockdog/bridge-core';

import { getBridgeInstance } from '@shared/lib/bridge';

interface AlbumPickAsset extends ImageAsset {
  file?: File;
}

interface UploadOwnerAlbumPhotosParams {
  schoolId: number;
  assets: AlbumPickAsset[];
}

interface UploadOwnerAlbumPhotosResult {
  uploaded: MappedAlbumPhoto[];
  excludedCount: number;
  excludeReason?: string | null;
  s3FailedCount: number;
}

function normalizeContentType(mimeType: string) {
  const lower = mimeType.toLowerCase().trim();
  if (lower === 'image/jpg') return 'image/jpeg';
  return lower;
}

function resolveContentType(asset: AlbumPickAsset) {
  if (asset.file?.type) return normalizeContentType(asset.file.type);
  if (asset.mimeType) return normalizeContentType(asset.mimeType);

  const fileName = asset.file?.name ?? asset.fileName ?? '';
  const extension = fileName.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];

  if (extension === 'png') return 'image/png';
  if (extension === 'heic') return 'image/heic';
  if (extension === 'heif') return 'image/heif';
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';

  return 'image/jpeg';
}

function resolveFileName(asset: AlbumPickAsset, index: number) {
  const name = asset.file?.name ?? asset.fileName;
  if (name && name.trim().length > 0) return name.trim();
  return `album-${Date.now()}-${index}.jpg`;
}

function resolveFileSize(asset: AlbumPickAsset) {
  if (typeof asset.file?.size === 'number' && asset.file.size > 0) return asset.file.size;
  if (typeof asset.fileSize === 'number' && asset.fileSize > 0) return asset.fileSize;
  return 0;
}

async function putFileToS3Web(uploadUrl: string, file: File, contentType: string) {
  const { fetchWithUploadTimeout } = await import('@shared/api/lib/fetchWithUploadTimeout');
  // upload-urls에 선언한 contentType과 동일하게 넣어야 commit HeadObject 검증 통과
  const response = await fetchWithUploadTimeout(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`S3 업로드에 실패했습니다. 상태 코드: ${response.status}`);
  }
}

async function putFileToS3Native(uri: string, uploadUrl: string, contentType: string) {
  const bridge = getBridgeInstance();
  if (!bridge) {
    throw new Error('네이티브 브릿지를 사용할 수 없습니다.');
  }

  await bridge.request(METHODS.putFileToPresignedUrl, {
    uri,
    uploadUrl,
    // 네이티브 uploadAsync는 Content-Type
    contentType,
  });
}

async function uploadOwnerAlbumPhotos({
  schoolId,
  assets,
}: UploadOwnerAlbumPhotosParams): Promise<UploadOwnerAlbumPhotosResult> {
  const prepared = assets.map((asset, index) => {
    const contentType = resolveContentType(asset);
    const size = resolveFileSize(asset);
    const filename = resolveFileName(asset, index);

    return { asset, contentType, size, filename };
  });

  const invalidSize = prepared.some((item) => item.size <= 0);
  if (invalidSize) {
    throw new Error('파일 크기를 확인할 수 없는 사진이 있습니다.');
  }

  const files: AlbumUploadFileRequest[] = prepared.map(({ filename, contentType, size }) => ({
    filename,
    contentType,
    size,
  }));

  const uploadUrlsResponse = await postAlbumUploadUrls(schoolId, { files });
  if (uploadUrlsResponse.status !== 200 || !uploadUrlsResponse.data?.files?.length) {
    throw new Error(uploadUrlsResponse.message || '업로드 URL을 발급받지 못했습니다.');
  }

  const uploadTargets = uploadUrlsResponse.data.files;
  if (uploadTargets.length !== prepared.length) {
    throw new Error('업로드 URL 개수가 선택한 사진 수와 일치하지 않습니다.');
  }

  const commitItems: AlbumCommitItemRequest[] = [];
  let s3FailedCount = 0;

  for (let index = 0; index < prepared.length; index += 1) {
    const item = prepared[index];
    const target = uploadTargets[index];
    if (!item || !target?.tempKey || !target.uploadUrl) {
      s3FailedCount += 1;
      continue;
    }

    const { asset, contentType, filename } = item;

    try {
      if (asset.file) {
        await putFileToS3Web(target.uploadUrl, asset.file, contentType);
      } else if (asset.uri || asset.preSignedUrl) {
        await putFileToS3Native(asset.uri ?? asset.preSignedUrl, target.uploadUrl, contentType);
      } else {
        s3FailedCount += 1;
        continue;
      }

      commitItems.push({
        tempKey: target.tempKey,
        originalFilename: filename,
      });
    } catch (error) {
      console.error('[owner-album] S3 PUT failed', error);
      s3FailedCount += 1;
    }
  }

  if (commitItems.length === 0) {
    throw new Error('업로드에 성공한 사진이 없습니다.');
  }

  try {
    const commitResponse = await postAlbumPhotosCommit(schoolId, { items: commitItems });
    if (commitResponse.status !== 200 || !commitResponse.data) {
      throw new Error(commitResponse.message || '업로드 커밋에 실패했습니다.');
    }

    const uploaded = (commitResponse.data.uploaded ?? []).map((photo, index) =>
      mapAlbumPhotoDto(photo, index)
    );

    // 웹 skipUpload objectURL 정리
    for (const asset of assets) {
      if (asset.file && asset.preSignedUrl.startsWith('blob:')) {
        URL.revokeObjectURL(asset.preSignedUrl);
      }
    }

    return {
      uploaded,
      excludedCount: commitResponse.data.excludedCount ?? 0,
      excludeReason: commitResponse.data.excludeReason,
      s3FailedCount,
    };
  } catch (error) {
    console.error('[owner-album] commit failed', {
      schoolId,
      itemCount: commitItems.length,
      sample: commitItems[0],
      error,
    });
    throw error;
  }
}

export { uploadOwnerAlbumPhotos };
export type { AlbumPickAsset, UploadOwnerAlbumPhotosParams, UploadOwnerAlbumPhotosResult };
