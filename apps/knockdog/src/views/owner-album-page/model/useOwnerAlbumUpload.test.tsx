// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { captureException } from '@sentry/nextjs';
import { METHODS } from '@knockdog/bridge-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useOwnerAlbumUpload } from './useOwnerAlbumUpload';

const mocks = vi.hoisted(() => ({
  pickImage: vi.fn(),
  request: vi.fn(),
  postAlbumUploadUrls: vi.fn(),
  postAlbumPhotosCommit: vi.fn(),
  openOwnerAlbumAlert: vi.fn(),
}));

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@tanstack/react-query', () => ({ useQueryClient: () => ({}) }));
vi.mock('@entities/owner-album', () => ({
  useOwnerAlbumPhotosInfiniteQuery: () => ({}),
  useAlbumPhotoDeleteMutation: () => ({}),
  postAlbumUploadUrls: mocks.postAlbumUploadUrls,
  postAlbumPhotosCommit: mocks.postAlbumPhotosCommit,
}));
vi.mock('@entities/user', () => ({ useUserStore: () => 1 }));
vi.mock('@features/role-conversion', () => ({ useOwnerRole: () => ({ schoolId: 1 }) }));
vi.mock('@views/owner-album-page/config/ownerAlbumContent', () => ({
  ownerAlbumContent: { maxSelectionCount: 10, upload: { networkFailedTitle: 'Upload failed' } },
}));
vi.mock('@views/owner-album-page/ui/OwnerAlbumAlertDialog', () => ({
  openOwnerAlbumAlert: mocks.openOwnerAlbumAlert,
}));
vi.mock('@shared/lib/media', () => ({ useImagePicker: () => ({ pickImage: mocks.pickImage }) }));
vi.mock('@shared/lib/bridge', () => ({ getBridgeInstance: () => ({ request: mocks.request }) }));
vi.mock('@shared/lib/analytics', () => ({}));
vi.mock('@shared/ui/toast', () => ({ toast: vi.fn() }));

describe('owner album upload reporting in the app WebView', () => {
  beforeEach(() => vi.resetAllMocks());

  it('reports one final failure after both native uploads fail', async () => {
    const assets = [1, 2].map((index) => ({
      uri: `file:///mock-${index}.jpg`,
      mimeType: 'image/jpeg',
      fileSize: 1024,
    }));
    mocks.pickImage.mockResolvedValue({ assets, cancelled: false });
    mocks.postAlbumUploadUrls.mockResolvedValue({
      status: 200,
      data: {
        files: assets.map((_, index) => ({
          tempKey: `mock-${index}`,
          uploadUrl: `https://storage.test/mock-${index}`,
        })),
      },
    });
    mocks.request.mockRejectedValue({ code: 'EUNAVAILABLE', message: 'Mock S3 failure' });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { result, unmount } = renderHook(useOwnerAlbumUpload);

    try {
      await act(() => result.current.handleUploadClick());

      expect(mocks.request).toHaveBeenCalledTimes(2);
      expect(mocks.request).toHaveBeenCalledWith(METHODS.putFileToPresignedUrl, expect.any(Object));
      expect(mocks.postAlbumPhotosCommit).not.toHaveBeenCalled();
      expect(mocks.openOwnerAlbumAlert).toHaveBeenCalledOnce();
      expect(captureException).toHaveBeenCalledExactlyOnceWith(expect.any(Error), {
        tags: { feature: 'album_upload', stage: 's3_upload', source: 'critical_flow' },
      });
    } finally {
      unmount();
      consoleError.mockRestore();
    }
  });
});
