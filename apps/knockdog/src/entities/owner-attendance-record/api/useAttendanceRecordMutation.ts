import { useMutation } from '@tanstack/react-query';

import {
  postAttendanceRecordDraft,
  postAttendanceRecordSend,
} from './attendanceRecord';

function useAttendanceRecordMutation() {
  const draftMutation = useMutation({
    mutationFn: postAttendanceRecordDraft,
  });

  const sendMutation = useMutation({
    mutationFn: postAttendanceRecordSend,
  });

  return {
    draftMutation,
    sendMutation,
  };
}

export { useAttendanceRecordMutation };
