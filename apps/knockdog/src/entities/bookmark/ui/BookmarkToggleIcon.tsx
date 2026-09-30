'use client';

import { useEffect, useState } from 'react';
import { IconButton } from '@knockdog/ui';
import { useBookmarkPostMutation, useBookmarkDeleteMutation } from '../api/useBookmarkMutation';
import { trackSchoolBookmarkChanged, type BookmarkEntryPoint } from '@shared/lib/analytics';

interface BookmarkToggleIconProps {
  id: string;
  bookmarked: boolean;
  disabled?: boolean;
  className?: string;
  entryPoint?: BookmarkEntryPoint;
}

const BookmarkToggleIcon = ({
  id,
  bookmarked,
  disabled = false,
  className = '',
  entryPoint = 'other',
}: BookmarkToggleIconProps) => {
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);
  const { mutate: postBookmark, isPending: isPosting } = useBookmarkPostMutation();
  const { mutate: deleteBookmark, isPending: isDeleting } = useBookmarkDeleteMutation();

  useEffect(() => {
    setIsBookmarked(bookmarked);
  }, [bookmarked]);

  const isMutating = isPosting || isDeleting;

  return (
    <IconButton
      icon={isBookmarked ? 'BookmarkFill' : 'BookmarkLine'}
      className={className}
      disabled={isMutating || disabled}
      onClick={(event) => {
        event.stopPropagation();

        if (isBookmarked) {
          deleteBookmark(id, {
            onSuccess: () => {
              setIsBookmarked(false);
              trackSchoolBookmarkChanged({ listing_id: id, is_bookmarked: 0, entry_point: entryPoint });
            },
          });
        } else {
          postBookmark(id, {
            onSuccess: () => {
              setIsBookmarked(true);
              trackSchoolBookmarkChanged({ listing_id: id, is_bookmarked: 1, entry_point: entryPoint });
            },
          });
        }
      }}
    />
  );
};

export { BookmarkToggleIcon };
