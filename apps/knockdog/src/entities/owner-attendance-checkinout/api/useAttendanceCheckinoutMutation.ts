import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  postAttendanceCancelCheckIn,
  postAttendanceCancelCheckOut,
  postAttendanceCheckIn,
  postAttendanceCheckOut,
  type AttendanceCheckinoutActionParams,
} from './attendanceCheckinout';
import {
  OWNER_ATTENDANCE_CHECKINOUT_CANDIDATES_QUERY_KEY,
  OWNER_ATTENDANCE_CHECKINOUT_SUMMARY_QUERY_KEY,
} from './useAttendanceCheckinoutQuery';

interface UseAttendanceCheckinoutMutationOptions {
  userId?: string;
}

function useAttendanceCheckinoutMutation({ userId }: UseAttendanceCheckinoutMutationOptions = {}) {
  const queryClient = useQueryClient();

  const invalidateAttendanceCheckinout = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [OWNER_ATTENDANCE_CHECKINOUT_CANDIDATES_QUERY_KEY, userId],
      }),
      queryClient.invalidateQueries({
        queryKey: [OWNER_ATTENDANCE_CHECKINOUT_SUMMARY_QUERY_KEY, userId],
      }),
    ]);
  };

  return {
    checkInMutation: useMutation({
      mutationFn: (params: AttendanceCheckinoutActionParams) => postAttendanceCheckIn(params),
      onSuccess: invalidateAttendanceCheckinout,
    }),
    checkOutMutation: useMutation({
      mutationFn: (params: AttendanceCheckinoutActionParams) => postAttendanceCheckOut(params),
      onSuccess: invalidateAttendanceCheckinout,
    }),
    cancelCheckInMutation: useMutation({
      mutationFn: (params: AttendanceCheckinoutActionParams) => postAttendanceCancelCheckIn(params),
      onSuccess: invalidateAttendanceCheckinout,
    }),
    cancelCheckOutMutation: useMutation({
      mutationFn: (params: AttendanceCheckinoutActionParams) =>
        postAttendanceCancelCheckOut(params),
      onSuccess: invalidateAttendanceCheckinout,
    }),
  };
}

export { useAttendanceCheckinoutMutation };
