import { expect, test, vi } from 'vitest';

import { postSchoolReviewImageUploadUrls } from '@entities/review';
import { getBridgeInstance } from '@shared/lib/bridge';

import { resolveSchoolReviewImages } from './uploadSchoolReviewImages';

vi.mock('@entities/review', () => ({ postSchoolReviewImageUploadUrls: vi.fn() }));
vi.mock('@shared/lib/bridge', () => ({ getBridgeInstance: vi.fn() }));

const photo = {
  id: 'photo',
  url: 'file:///photo.jpg',
  uri: 'file:///photo.jpg',
  fileName: 'photo.jpg',
  contentType: 'image/jpeg',
  size: 123,
};

test('첨부 시 업로드한 사진은 등록할 때 같은 임시 키를 사용한다', async () => {
  vi.mocked(postSchoolReviewImageUploadUrls).mockClear();

  const images = await resolveSchoolReviewImages(1, [{ ...photo, tempKey: 'uploaded/photo' }]);

  expect(images).toEqual([{ tempKey: 'uploaded/photo', originalFilename: 'photo.jpg' }]);
  expect(postSchoolReviewImageUploadUrls).not.toHaveBeenCalled();
});

test('사진 업로드 URL 요청이 실패하면 첨부 작업이 실패한다', async () => {
  vi.mocked(postSchoolReviewImageUploadUrls).mockRejectedValueOnce(new Error('offline'));

  await expect(resolveSchoolReviewImages(1, [photo])).rejects.toThrow();
  expect(getBridgeInstance).not.toHaveBeenCalled();
});
