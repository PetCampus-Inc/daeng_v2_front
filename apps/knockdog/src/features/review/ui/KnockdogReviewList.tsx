'use client';

import { Divider } from '@knockdog/ui';

import type { KnockdogReview } from '../config/knockdogReviewMock';

import { KnockdogReviewCard } from './KnockdogReviewCard';

interface KnockdogReviewListProps {
  reviews: KnockdogReview[];
  lastItemRef?: (node: HTMLDivElement | null) => void;
  onHelpfulToggle: (reviewId: string) => void;
  onEdit: (reviewId: string) => void;
  onDelete: (reviewId: string) => void;
  onReport: (reviewId: string) => void;
}

function KnockdogReviewList({
  reviews,
  lastItemRef,
  onHelpfulToggle,
  onEdit,
  onDelete,
  onReport,
}: KnockdogReviewListProps) {
  return (
    <div>
      {reviews.map((review, index) => (
        <div key={review.id} ref={index === reviews.length - 1 ? lastItemRef : undefined}>
          {index > 0 ? (
            <div className='py-1'>
              <Divider />
            </div>
          ) : null}
          <KnockdogReviewCard
            review={review}
            onHelpfulToggle={onHelpfulToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            onReport={onReport}
          />
        </div>
      ))}
    </div>
  );
}

export { KnockdogReviewList };
