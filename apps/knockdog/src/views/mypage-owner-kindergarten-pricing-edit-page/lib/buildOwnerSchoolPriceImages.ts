import type { WebImageAsset } from '@shared/lib/media';

import { buildOwnerSchoolImagePayload } from '@entities/owner-school';

/** PhotoUploader assets → PUT priceImages payload */
async function buildOwnerSchoolPriceImages({
  assets,
  moveImage,
  movePath = 'owner/school/price',
}: {
  assets: WebImageAsset[];
  moveImage: (params: { key: string; path: string }) => Promise<{ data?: string | null }>;
  movePath?: string;
}) {
  return buildOwnerSchoolImagePayload({
    assets,
    moveImage,
    movePath,
    emptyKeyErrorMessage: '업로드된 가격표 이미지 키가 없어요',
    moveErrorMessage: '가격표 이미지 이동에 실패했어요',
  });
}

export { buildOwnerSchoolPriceImages };
