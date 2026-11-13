import { describe, expect, test } from 'vitest';

import { buildDiaryPhotoRequest, DIARY_PHOTO_MAX_BYTES } from './uploadDiaryPhotoFile';

describe('일기 사진 업로드 요청', () => {
  test('HEIC는 JPEG로 둔갑시키지 않는다', () => {
    const request = buildDiaryPhotoRequest(
      { key: '', preSignedUrl: '', fileName: 'IMG.HEIC', mimeType: 'image/heic', fileSize: 1200 },
      0
    );

    expect(request).toBeNull();
  });

  test('JPEG는 확장자를 jpg로 맞추고 3MB 이하면 통과한다', () => {
    const request = buildDiaryPhotoRequest(
      { key: '', preSignedUrl: '', fileName: 'park.JPEG', mimeType: 'image/jpeg', fileSize: 1200 },
      0
    );

    expect(request).toMatchObject({ filename: 'park.jpg', contentType: 'image/jpeg', size: 1200 });
  });

  test('PNG는 png로 유지한다', () => {
    const request = buildDiaryPhotoRequest(
      { key: '', preSignedUrl: '', fileName: 'shot', mimeType: 'image/png', fileSize: 10 },
      1
    );

    expect(request).toMatchObject({ filename: 'shot.png', contentType: 'image/png', size: 10 });
  });

  test('3MB를 넘으면 통과하지 않는다', () => {
    const request = buildDiaryPhotoRequest(
      { key: '', preSignedUrl: '', fileName: 'park.jpg', mimeType: 'image/jpeg', fileSize: DIARY_PHOTO_MAX_BYTES + 1 },
      0
    );

    expect(request).toBeNull();
  });
});
