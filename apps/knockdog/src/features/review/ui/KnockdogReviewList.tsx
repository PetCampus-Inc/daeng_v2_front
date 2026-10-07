'use client';

import { Divider } from '@knockdog/ui';

import type { KnockdogReview } from '../config/knockdogReviewMock';

import { KnockdogReviewCard } from './KnockdogReviewCard';

interface KnockdogReviewListProps {
  reviews: KnockdogReview[];
  onHelpfulToggle: (reviewId: string) => void;
  onEdit: (reviewId: string) => void;
  onDelete: (reviewId: string) => void;
}

function KnockdogReviewList({ reviews, onHelpfulToggle, onEdit, onDelete }: KnockdogReviewListProps) {
  return (
    <div>
      {reviews.map((review, index) => (
        <div key={review.id}>
          {index > 0 ? (
            <div className='py-1'>
              <Divider />
            </div>
          ) : null}
          <KnockdogReviewCard review={review} onHelpfulToggle={onHelpfulToggle} onEdit={onEdit} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );
}

export { KnockdogReviewList };
