import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteAlbumPhoto, postAlbumPhotosCommit, postAlbumUploadUrls } from './ownerAlbum';
import { ownerAlbumPhotosQueryKey } from './useOwnerAlbumPhotosQuery';
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

interface UseAlbumPhotoDeleteMutationOptions {
  schoolId?: number | null;
  userId?: string;
}

function useAlbumPhotoDeleteMutation({ schoolId, userId }: UseAlbumPhotoDeleteMutationOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoId: string) => {
      if (schoolId == null) {
        throw new Error('schoolId is required');
      }

      return deleteAlbumPhoto(schoolId, photoId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ownerAlbumPhotosQueryKey(schoolId, userId),
      });
    },
  });
}

export {
  useAlbumUploadUrlsMutation,
  useAlbumPhotosCommitMutation,
  useAlbumPhotoDeleteMutation,
};
