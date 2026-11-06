'use client';

import type { Review } from '@entities/review';
import { Avatar, AvatarImage, AvatarFallback, Icon } from '@knockdog/ui';
import { useStackNavigation } from '@shared/lib/bridge';

/** Jackson `asText()`가 JSON null을 문자열 "null"로 내려서 후기 탭 누르면 오류가 발생한다. */
function isRenderableImageSrc(src: string | null | undefined) {
  if (!src || src === 'null' || src === 'undefined') return false;
  return /^(https?:|blob:|data:|\/)/i.test(src);
}

function isReviewLink(url: string | null | undefined) {
  if (!url || url === 'null' || url === 'undefined') return false;
  return /^https?:\/\//i.test(url);
}

export function ReviewCard({ username, profileImage, title, content, updatedAt, reviewUrl }: Review) {
  const { push } = useStackNavigation();
  const profileSrc = isRenderableImageSrc(profileImage) ? profileImage : undefined;
  const reviewLink = isReviewLink(reviewUrl) ? reviewUrl : undefined;

  const handleClick = () => {
    if (reviewLink) {
      push({ pathname: reviewLink });
    }
  };

  return (
    <div
      className='bg-bg-50 flex flex-col gap-3 rounded-lg p-4'
      onClick={handleClick}
      role={reviewLink ? 'button' : undefined}
      style={reviewLink ? { cursor: 'pointer' } : undefined}
    >
      <div className='flex flex-col gap-1'>
        <div className='flex items-center gap-1'>
          <Avatar className='size-6'>
            {profileSrc ? <AvatarImage src={profileSrc} alt='' /> : null}
            <AvatarFallback className='bg-fill-secondary-200 p-[3px]'>
              <Icon icon='User' className='size-6' />
            </AvatarFallback>
          </Avatar>
          <span className='body2-extrabold truncate'>{username}</span>
        </div>
        <span className='body1-bold truncate'>{title}</span>
        <p className='body2-regular text-text-secondary line-clamp-2'>{content}</p>
      </div>
      <p className='body2-regular text-text-tertiary'>{updatedAt}</p>
    </div>
  );
}
