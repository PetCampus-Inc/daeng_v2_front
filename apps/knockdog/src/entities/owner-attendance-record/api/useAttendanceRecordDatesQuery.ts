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
      return new Set(
        dates.map((d) => {
          const [y, m, day] = d;
          return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }),
      );
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
