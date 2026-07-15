import type { WebImageAsset } from '@shared/lib/media';

function toS3Key(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';

  try {
    if (trimmed.includes('://')) {
      const url = new URL(trimmed);
      return url.pathname.replace(/^\//, '');
    }
  } catch {
    // URL 파싱 실패 시 path처럼 취급
  }

  return trimmed.replace(/^\//, '');
}

function resolveAssetKey(asset: WebImageAsset) {
  const fromKey = asset.key ? toS3Key(asset.key) : '';
  if (fromKey) return fromKey;

  const fromUri = asset.uri ? toS3Key(asset.uri) : '';
  if (fromUri) return fromUri;

  return asset.preSignedUrl ? toS3Key(asset.preSignedUrl) : '';
}

function isTempKey(key: string) {
  return key.includes('temp');
}

interface BuildOwnerSchoolImagePayloadParams {
  assets: WebImageAsset[];
  moveImage: (params: { key: string; path: string }) => Promise<{ data?: string | null }>;
  movePath: string;
  emptyKeyErrorMessage?: string;
  moveErrorMessage?: string;
}

/** PhotoUploader assets → { s3Key, displayOrder }. temp 키는 move 후 영구 경로로 변환 */
async function buildOwnerSchoolImagePayload({
  assets,
  moveImage,
  movePath,
  emptyKeyErrorMessage = '업로드된 이미지 키가 없어요',
  moveErrorMessage = '이미지 이동에 실패했어요',
}: BuildOwnerSchoolImagePayloadParams) {
  return Promise.all(
    assets.map(async (asset, index) => {
      let s3Key = resolveAssetKey(asset);
      if (!s3Key) {
        throw new Error(emptyKeyErrorMessage);
      }

      if (isTempKey(s3Key)) {
        const moved = await moveImage({ key: s3Key, path: movePath });
        const movedKey = moved.data ? toS3Key(moved.data) : '';
        if (!movedKey) {
          throw new Error(moveErrorMessage);
        }
        s3Key = movedKey;
      }

      return {
        s3Key,
        displayOrder: index,
      };
    })
  );
}

export { buildOwnerSchoolImagePayload };
