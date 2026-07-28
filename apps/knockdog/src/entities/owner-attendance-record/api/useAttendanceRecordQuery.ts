import { useQuery } from '@tanstack/react-query';

import { toAttendanceRecord } from '../model/attendanceRecord';
import { getAttendanceRecord } from './attendanceRecord';

const OWNER_ATTENDANCE_RECORD_QUERY_KEY = 'ownerAttendanceRecord';

const ownerAttendanceRecordQueryKey = (petId?: string, date?: string) =>
  [OWNER_ATTENDANCE_RECORD_QUERY_KEY, petId, date] as const;

interface UseAttendanceRecordQueryOptions {
  petId?: string;
  date?: string;
  enabled?: boolean;
}

function useAttendanceRecordQuery({
  petId,
  date,
  enabled = true,
}: UseAttendanceRecordQueryOptions) {
  return useQuery({
    queryKey: ownerAttendanceRecordQueryKey(petId, date),
    queryFn: () => getAttendanceRecord({ petId: petId!, date }),
    select: (response) => toAttendanceRecord(response.data),
    enabled: enabled && Boolean(petId),
    staleTime: 0,
  });
}

export {
  OWNER_ATTENDANCE_RECORD_QUERY_KEY,
  ownerAttendanceRecordQueryKey,
  useAttendanceRecordQuery,
};
