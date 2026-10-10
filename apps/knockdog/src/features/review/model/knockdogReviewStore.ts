'use client';

import { useSyncExternalStore } from 'react';

import { MOCK_KNOCKDOG_REVIEWS, type KnockdogReview } from '../config/knockdogReviewMock';

interface KnockdogReviewEdit {
  score: number;
  content: string;
  images: string[];
}

let reviews: KnockdogReview[] = MOCK_KNOCKDOG_REVIEWS;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribeKnockdogReviews(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getKnockdogReviews() {
  return reviews;
}

function toggleKnockdogReviewHelpful(reviewId: string) {
  reviews = reviews.map((review) => {
    if (review.id !== reviewId) return review;
    const isHelpful = !review.isHelpful;
    return {
      ...review,
      isHelpful,
      helpfulCount: Math.max(0, review.helpfulCount + (isHelpful ? 1 : -1)),
    };
  });
  emit();
}

function deleteKnockdogReview(reviewId: string) {
  reviews = reviews.filter((review) => review.id !== reviewId);
  emit();
}

/** 리뷰 수정 API 연동 전 로컬 반영. 처리 중 로딩이 보이도록 짧게 대기한다. */
async function saveKnockdogReviewEdit(reviewId: string, patch: KnockdogReviewEdit) {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 400);
  });

  const current = reviews.find((review) => review.id === reviewId);
  if (!current) throw new Error('REVIEW_NOT_FOUND');

  reviews = reviews.map((review) => (review.id === reviewId ? { ...review, ...patch } : review));
  emit();
}

function useKnockdogReviews() {
  return useSyncExternalStore(subscribeKnockdogReviews, getKnockdogReviews, () => MOCK_KNOCKDOG_REVIEWS);
}

export { deleteKnockdogReview, saveKnockdogReviewEdit, toggleKnockdogReviewHelpful, useKnockdogReviews };
export type { KnockdogReviewEdit };
