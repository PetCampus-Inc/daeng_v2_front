import { useQuery } from '@tanstack/react-query';

import { getAttendanceRecordDates } from './attendanceRecord';

const OWNER_ATTENDANCE_RECORD_DATES_QUERY_KEY = 'ownerAttendanceRecordDates';

const ownerAttendanceRecordDatesQueryKey = (petId?: string, from?: string, to?: string) =>
  [OWNER_ATTENDANCE_RECORD_DATES_QUERY_KEY, petId, from, to] as const;

interface UseAttendanceRecordDatesQueryOptions {
  petId?: string;
  from?: string;
  to?: string;
  enabled?: boolean;
}

function useAttendanceRecordDatesQuery({
  petId,
  from,
  to,
  enabled = true,
}: UseAttendanceRecordDatesQueryOptions) {
  return useQuery({
    queryKey: ownerAttendanceRecordDatesQueryKey(petId, from, to),
    queryFn: () => getAttendanceRecordDates({ petId: petId!, from: from!, to: to! }),
    select: (response) => {
      const raw = response.data;
      if (!raw) return new Set<string>();

      const dates = raw.dates ?? [];
      const dateKeys: string[] = [];

      for (const dateParts of dates) {
        if (!Array.isArray(dateParts) || dateParts.length < 3) continue;
        const [year, month, day] = dateParts;
        if (
          typeof year !== 'number' ||
          typeof month !== 'number' ||
          typeof day !== 'number' ||
          !Number.isFinite(year) ||
          !Number.isFinite(month) ||
          !Number.isFinite(day)
        ) {
          continue;
        }
        dateKeys.push(
          `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        );
      }

      return new Set(dateKeys);
    },
    enabled: enabled && Boolean(petId) && Boolean(from) && Boolean(to),
    staleTime: 0,
  });
}

export {
  OWNER_ATTENDANCE_RECORD_DATES_QUERY_KEY,
  ownerAttendanceRecordDatesQueryKey,
  useAttendanceRecordDatesQuery,
};
