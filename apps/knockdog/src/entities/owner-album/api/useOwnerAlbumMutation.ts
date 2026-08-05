import { useMutation } from '@tanstack/react-query';

import { postAlbumPhotosCommit, postAlbumUploadUrls } from './ownerAlbum';
import type { AlbumCommitRequest, AlbumUploadUrlsRequest } from '../model/types';

function useAlbumUploadUrlsMutation() {
  return useMutation({
    mutationFn: ({ schoolId, body }: { schoolId: number; body: AlbumUploadUrlsRequest }) =>
      postAlbumUploadUrls(schoolId, body),
  });
}

function useAlbumPhotosCommitMutation() {
  return useMutation({
    mutationFn: ({ schoolId, body }: { schoolId: number; body: AlbumCommitRequest }) =>
      postAlbumPhotosCommit(schoolId, body),
  });
}

export { useAlbumUploadUrlsMutation, useAlbumPhotosCommitMutation };
