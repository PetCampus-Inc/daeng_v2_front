import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { type ApiResponse } from '@shared/api';
import { moveImage } from './api/moveImage';

interface MoveImageParams {
  key: string;
  path: string;
}

function useMoveImageMutation(
  options?: Omit<UseMutationOptions<ApiResponse<string, string>, Error, MoveImageParams>, 'mutationFn'>
) {
  return useMutation({
    mutationFn: moveImage,
    ...options,
  });
}

export { useMoveImageMutation, type MoveImageParams };
