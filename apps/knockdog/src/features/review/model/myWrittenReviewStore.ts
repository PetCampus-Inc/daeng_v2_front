'use client';

import { useSyncExternalStore } from 'react';

import { MOCK_MY_WRITTEN_REVIEWS, type MyWrittenReview } from '../config/myWrittenReviewMock';

interface MyWrittenReviewEdit {
  score: number;
  content: string;
  images: string[];
}

let reviews: MyWrittenReview[] = MOCK_MY_WRITTEN_REVIEWS;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribeMyWrittenReviews(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getMyWrittenReviews() {
  return reviews;
}

async function deleteMyWrittenReview(reviewId: string) {
  if (!reviews.some((review) => review.id === reviewId)) throw new Error('REVIEW_NOT_FOUND');

  await new Promise((resolve) => {
    window.setTimeout(resolve, 400);
  });

  if (!reviews.some((review) => review.id === reviewId)) throw new Error('REVIEW_NOT_FOUND');

  reviews = reviews.filter((review) => review.id !== reviewId);
  emit();
}

async function saveMyWrittenReviewEdit(reviewId: string, patch: MyWrittenReviewEdit) {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 400);
  });

  if (!reviews.some((review) => review.id === reviewId)) throw new Error('REVIEW_NOT_FOUND');

  reviews = reviews.map((review) =>
    review.id === reviewId ? { ...review, ...patch, updatedAt: new Date().toISOString() } : review
  );
  emit();
}

function useMyWrittenReviews() {
  return useSyncExternalStore(subscribeMyWrittenReviews, getMyWrittenReviews, () => MOCK_MY_WRITTEN_REVIEWS);
}

export { deleteMyWrittenReview, saveMyWrittenReviewEdit, useMyWrittenReviews };
export type { MyWrittenReviewEdit };
