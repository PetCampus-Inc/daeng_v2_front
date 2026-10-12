import { Suspense } from 'react';

import { ReviewReportPage } from '@views/review-report-page';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ReviewReportPage />
    </Suspense>
  );
}
