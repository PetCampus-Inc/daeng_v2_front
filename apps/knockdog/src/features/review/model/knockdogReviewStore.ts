'use client';

import { useSyncExternalStore } from 'react';

import { MOCK_KNOCKDOG_REVIEWS, type KnockdogReview } from '../config/knockdogReviewMock';
import type { ReviewRatingCounts } from '../lib/reviewRating';

interface KnockdogReviewEdit {
  score: number;
  content: string;
  images: string[];
}

const INITIAL_KNOCKDOG_RATING_COUNTS: ReviewRatingCounts = {
  score5: 7200,
  score4: 1500,
  score3: 600,
  score2: 400,
  score1: 299,
};

let reviews: KnockdogReview[] = MOCK_KNOCKDOG_REVIEWS;
let ratingCounts: ReviewRatingCounts = INITIAL_KNOCKDOG_RATING_COUNTS;
const listeners = new Set<() => void>();

function scoreCountKey(score: number): keyof ReviewRatingCounts {
  const rounded = Math.min(5, Math.max(1, Math.round(score)));
  if (rounded === 5) return 'score5';
  if (rounded === 4) return 'score4';
  if (rounded === 3) return 'score3';
  if (rounded === 2) return 'score2';
  return 'score1';
}

function shiftRatingCount(fromScore: number, toScore: number) {
  const fromKey = scoreCountKey(fromScore);
  const toKey = scoreCountKey(toScore);
  if (fromKey === toKey) return;

  ratingCounts = {
    ...ratingCounts,
    [fromKey]: Math.max(0, ratingCounts[fromKey] - 1),
    [toKey]: ratingCounts[toKey] + 1,
  };
}

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

/** 리뷰 삭제 API 연동 전 로컬 반영. 실패하면 목록을 유지한다. */
async function deleteKnockdogReview(reviewId: string) {
  const current = reviews.find((review) => review.id === reviewId);
  if (!current) throw new Error('REVIEW_NOT_FOUND');

  await new Promise((resolve) => {
    window.setTimeout(resolve, 400);
  });

  const latest = reviews.find((review) => review.id === reviewId);
  if (!latest) throw new Error('REVIEW_NOT_FOUND');

  reviews = reviews.filter((review) => review.id !== reviewId);
  const key = scoreCountKey(latest.score);
  ratingCounts = {
    ...ratingCounts,
    [key]: Math.max(0, ratingCounts[key] - 1),
  };
  emit();
}

/** 리뷰 수정 API 연동 전 로컬 반영. 처리 중 로딩이 보이도록 짧게 대기한다. */
async function saveKnockdogReviewEdit(reviewId: string, patch: KnockdogReviewEdit) {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 400);
  });

  const current = reviews.find((review) => review.id === reviewId);
  if (!current) throw new Error('REVIEW_NOT_FOUND');

  shiftRatingCount(current.score, patch.score);
  reviews = reviews.map((review) => (review.id === reviewId ? { ...review, ...patch } : review));
  emit();
}

function getKnockdogRatingCounts() {
  return ratingCounts;
}

function useKnockdogReviews() {
  return useSyncExternalStore(subscribeKnockdogReviews, getKnockdogReviews, () => MOCK_KNOCKDOG_REVIEWS);
}

function useKnockdogRatingCounts() {
  return useSyncExternalStore(
    subscribeKnockdogReviews,
    getKnockdogRatingCounts,
    () => INITIAL_KNOCKDOG_RATING_COUNTS
  );
}

export {
  deleteKnockdogReview,
  saveKnockdogReviewEdit,
  toggleKnockdogReviewHelpful,
  useKnockdogRatingCounts,
  useKnockdogReviews,
};
export type { KnockdogReviewEdit };
