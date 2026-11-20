import { Suspense } from 'react';
import { GuardianAttendanceRecordPage } from '@views/guardian-attendance-record-page';

export default function AttendanceRecordPage() {
  return (
    <Suspense fallback={<main className='bg-bg-0 min-h-dvh p-4' />}>
      <GuardianAttendanceRecordPage />
    </Suspense>
  );
}
