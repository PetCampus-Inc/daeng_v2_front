import { useMutation } from '@tanstack/react-query';

import { deleteBookmark, postBookmark } from '../api/bookmark';

// post
const useBookmarkPostMutation = () => {
  return useMutation({
    mutationFn: (id: string) => postBookmark(id),
  });
};

// delete
const useBookmarkDeleteMutation = () => {
  return useMutation({
    mutationFn: (id: string) => deleteBookmark(id),
  });
};

export { useBookmarkPostMutation, useBookmarkDeleteMutation };
