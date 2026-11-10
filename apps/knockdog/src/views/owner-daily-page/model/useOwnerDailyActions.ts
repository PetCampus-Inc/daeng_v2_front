import { useRef, useState } from 'react';

import {
  useAttendanceCheckinoutMutation,
  type AttendanceCheckinoutCandidate,
} from '@entities/owner-attendance-checkinout';

import { ApiError, REQUEST_FAILED_MESSAGE } from '@shared/api';
import { trackAttendanceAction } from '@shared/lib/analytics/gaEvents';
import { toast } from '@shared/ui/toast';

/** 다른 기기가 먼저 처리했거나(409-1) 예약이 취소된(409-4) 경우. 목록과 집계를 다시 불러와야 한다. */
const STALE_ATTENDANCE_ERROR_CODES: readonly string[] = ['ATTENDANCE_CHECKINOUT-409-1', 'ATTENDANCE_CHECKINOUT-409-4'];

interface ActionOptions {
  request: () => Promise<unknown>;
  successMessage: string;
  onSuccess?: () => void;
}

/**
 * 일과 화면의 원생 처리(등원·결석·하원) 동작을 관리한다. 취소 동작도 이어서 이 훅에 붙인다.
 * - 확인 모달 없이 바로 요청하고, 성공하면 안내 토스트를 보여 준다. 목록·집계는 mutation이 다시 조회한다.
 * - 요청 중인 원생은 `pendingPetIds`로 알려 버튼을 잠그고, 같은 원생의 중복 요청은 ref로도 막는다.
 * - 실패하면 카드 상태를 바꾸지 않고 실패 토스트만 보여 준다. 에러 `code`가 409-1·409-4면 목록·집계도 다시 조회한다.
 * @param params.dateKey 지금 보는 날짜(KST, `YYYY-MM-DD`). 분석 이벤트에 실린다.
 */
const useOwnerDailyActions = ({ userId, dateKey }: { userId?: string; dateKey: string }) => {
  const { checkInMutation, absentMutation, checkOutMutation, invalidateAttendanceCheckinout } = useAttendanceCheckinoutMutation({
    userId,
  });
  const inFlightPetIdsRef = useRef(new Set<string>());
  const [pendingPetIds, setPendingPetIds] = useState<ReadonlySet<string>>(() => new Set());

  const updatePending = (petId: string, isPending: boolean) => {
    if (isPending) inFlightPetIdsRef.current.add(petId);
    else inFlightPetIdsRef.current.delete(petId);
    setPendingPetIds(new Set(inFlightPetIdsRef.current));
  };

  /** 한 원생에 대한 처리 요청을 중복 없이 보내고 결과를 토스트로 알린다. */
  const runAction = async (petId: string, { request, successMessage, onSuccess }: ActionOptions) => {
    if (inFlightPetIdsRef.current.has(petId)) return;
    updatePending(petId, true);

    try {
      await request();
      onSuccess?.();
      toast({ type: 'success', shape: 'rounded', title: successMessage, nativeTitle: successMessage });
    } catch (error) {
      toast({ type: 'default', shape: 'rounded', title: REQUEST_FAILED_MESSAGE, nativeTitle: REQUEST_FAILED_MESSAGE });
      if (error instanceof ApiError && STALE_ATTENDANCE_ERROR_CODES.includes(String(error.code))) {
        await invalidateAttendanceCheckinout();
      }
    } finally {
      updatePending(petId, false);
    }
  };

  /** 등원 처리. */
  const handleCheckIn = (member: AttendanceCheckinoutCandidate) =>
    runAction(member.petId, {
      request: () => checkInMutation.mutateAsync({ petId: member.petId }),
      successMessage: '등원 처리가 완료되었어요',
      onSuccess: () => trackAttendanceAction({ action: 'check_in', pet_id: member.petId, service_date: dateKey }),
    });

  /** 결석 처리. */
  const handleAbsent = (member: AttendanceCheckinoutCandidate) =>
    runAction(member.petId, {
      request: () => absentMutation.mutateAsync({ petId: member.petId }),
      successMessage: '결석 처리가 완료되었어요',
    });

  /** 하원 처리. 등원목록 탭의 카드에서 확인 모달 없이 바로 처리한다. */
  const handleCheckOut = (member: Pick<AttendanceCheckinoutCandidate, 'petId'>) =>
    runAction(member.petId, {
      request: () => checkOutMutation.mutateAsync({ petId: member.petId }),
      successMessage: '하원 처리가 완료되었어요',
      onSuccess: () => trackAttendanceAction({ action: 'check_out', pet_id: member.petId, service_date: dateKey }),
    });

  return { pendingPetIds, handleCheckIn, handleAbsent, handleCheckOut };
};

export { useOwnerDailyActions };
