import { Suspense } from 'react';
import { WithdrawSurveyPage } from '@views/withdraw-survey-page';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <WithdrawSurveyPage />
    </Suspense>
  );
}
