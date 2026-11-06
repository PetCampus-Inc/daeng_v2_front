import { useQuery, keepPreviousData } from '@tanstack/react-query';

import {
  toAttendanceCheckinoutCandidates,
  toAttendanceCheckinoutSummary,
  toAttendanceCheckinoutToday,
  type CheckinoutStatus,
  type TodayAttendanceFilter,
} from '../model/attendanceCheckinout';
import {
  getAttendanceCheckinoutCandidates,
  getAttendanceCheckinoutSummary,
  getAttendanceCheckinoutToday,
} from './attendanceCheckinout';

const OWNER_ATTENDANCE_CHECKINOUT_CANDIDATES_QUERY_KEY = 'ownerAttendanceCheckinoutCandidates';
const OWNER_ATTENDANCE_CHECKINOUT_TODAY_QUERY_KEY = 'ownerAttendanceCheckinoutToday';
const OWNER_ATTENDANCE_CHECKINOUT_SUMMARY_QUERY_KEY = 'ownerAttendanceCheckinoutSummary';

interface UseAttendanceCheckinoutCandidatesQueryOptions {
  date?: string;
  q?: string;
  checkinoutStatus?: CheckinoutStatus;
  userId?: string;
  enabled?: boolean;
}

interface UseAttendanceCheckinoutTodayQueryOptions {
  date?: string;
  filter?: TodayAttendanceFilter;
  userId?: string;
  enabled?: boolean;
}

interface UseAttendanceCheckinoutSummaryQueryOptions {
  date?: string;
  userId?: string;
  enabled?: boolean;
}

const ownerAttendanceCheckinoutCandidatesQueryKey = ({
  userId,
  date,
  q,
  checkinoutStatus,
}: {
  userId?: string;
  date?: string;
  q?: string;
  checkinoutStatus?: CheckinoutStatus;
}) =>
  [OWNER_ATTENDANCE_CHECKINOUT_CANDIDATES_QUERY_KEY, userId, date, q, checkinoutStatus] as const;

const ownerAttendanceCheckinoutTodayQueryKey = ({
  userId,
  date,
  filter,
}: {
  userId?: string;
  date?: string;
  filter?: TodayAttendanceFilter;
}) => [OWNER_ATTENDANCE_CHECKINOUT_TODAY_QUERY_KEY, userId, date, filter] as const;

const ownerAttendanceCheckinoutSummaryQueryKey = ({
  userId,
  date,
}: {
  userId?: string;
  date?: string;
}) => [OWNER_ATTENDANCE_CHECKINOUT_SUMMARY_QUERY_KEY, userId, date] as const;

function useAttendanceCheckinoutCandidatesQuery({
  date,
  q,
  checkinoutStatus,
  userId,
  enabled = true,
}: UseAttendanceCheckinoutCandidatesQueryOptions = {}) {
  return useQuery({
    queryKey: ownerAttendanceCheckinoutCandidatesQueryKey({
      userId,
      date,
      q,
      checkinoutStatus,
    }),
    queryFn: () => getAttendanceCheckinoutCandidates({ date, q, checkinoutStatus }),
    select: (response) => toAttendanceCheckinoutCandidates(response.data),
    enabled,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

function useAttendanceCheckinoutTodayQuery({
  date,
  filter,
  userId,
  enabled = true,
}: UseAttendanceCheckinoutTodayQueryOptions = {}) {
  return useQuery({
    queryKey: ownerAttendanceCheckinoutTodayQueryKey({ userId, date, filter }),
    queryFn: () => getAttendanceCheckinoutToday({ date, filter }),
    select: (response) => toAttendanceCheckinoutToday(response.data),
    enabled,
    staleTime: 0,
  });
}

function useAttendanceCheckinoutSummaryQuery({
  date,
  userId,
  enabled = true,
}: UseAttendanceCheckinoutSummaryQueryOptions = {}) {
  return useQuery({
    queryKey: ownerAttendanceCheckinoutSummaryQueryKey({ userId, date }),
    queryFn: () => getAttendanceCheckinoutSummary({ date }),
    select: (response) => toAttendanceCheckinoutSummary(response.data),
    enabled,
    staleTime: 0,
  });
}

export {
  OWNER_ATTENDANCE_CHECKINOUT_CANDIDATES_QUERY_KEY,
  OWNER_ATTENDANCE_CHECKINOUT_SUMMARY_QUERY_KEY,
  OWNER_ATTENDANCE_CHECKINOUT_TODAY_QUERY_KEY,
  ownerAttendanceCheckinoutCandidatesQueryKey,
  ownerAttendanceCheckinoutSummaryQueryKey,
  ownerAttendanceCheckinoutTodayQueryKey,
  useAttendanceCheckinoutCandidatesQuery,
  useAttendanceCheckinoutSummaryQuery,
  useAttendanceCheckinoutTodayQuery,
};
