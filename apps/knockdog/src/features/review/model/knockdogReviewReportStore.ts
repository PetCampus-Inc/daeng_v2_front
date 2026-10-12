interface KnockdogReviewReportInput {
  reviewId: string;
  score: number;
  createdAt: string;
  content: string;
  reason: string;
  detail: string;
  reporterId: string;
}

interface KnockdogReviewReport extends KnockdogReviewReportInput {
  submittedAt: string;
}

const DUPLICATE_KNOCKDOG_REVIEW_REPORT_MESSAGE = '이미 신고한 리뷰예요.';

let reports: KnockdogReviewReport[] = [];

function hasKnockdogReviewReport(reviewId: string, reporterId: string) {
  return reports.some((report) => report.reviewId === reviewId && report.reporterId === reporterId);
}

/** 리뷰 신고 API 연동 전 로컬 반영. 같은 사용자가 같은 리뷰를 다시 신고하면 거절한다. */
async function submitKnockdogReviewReport(input: KnockdogReviewReportInput) {
  if (hasKnockdogReviewReport(input.reviewId, input.reporterId)) {
    throw new Error('ALREADY_REPORTED');
  }

  await new Promise((resolve) => {
    window.setTimeout(resolve, 400);
  });

  if (hasKnockdogReviewReport(input.reviewId, input.reporterId)) {
    throw new Error('ALREADY_REPORTED');
  }

  reports = [...reports, { ...input, submittedAt: new Date().toISOString() }];
}

export {
  DUPLICATE_KNOCKDOG_REVIEW_REPORT_MESSAGE,
  hasKnockdogReviewReport,
  submitKnockdogReviewReport,
};
export type { KnockdogReviewReport, KnockdogReviewReportInput };
