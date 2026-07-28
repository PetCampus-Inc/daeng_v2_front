import type { StoolStatus } from '@shared/ui/stool-status';

/** 알림장 배변 상태*/
type AttendanceRecordPoop =
  | 'HEALTHY'
  | 'HARD'
  | 'SOFT'
  | 'ABNORMAL'
  | 'CAUTION'
  | 'NONE';

type AttendanceRecordCondition =
  | 'ENERGETIC'
  | 'NORMAL'
  | 'CALM'
  | 'CHECK_AFTER_RETURN';

interface AttendanceRecordPayload {
  petId: number;
  date: string;
  condition: AttendanceRecordCondition | null;
  snack: string;
  poop: AttendanceRecordPoop | null;
  poopMemo: string;
  note: string;
}

interface BuildAttendanceRecordPayloadInput {
  petId: string;
  date: string;
  condition: AttendanceRecordCondition | null;
  snack: string;
  poop: StoolStatus | null;
  poopMemo: string;
  note: string;
}

const STOOL_STATUS_TO_POOP: Record<StoolStatus, AttendanceRecordPoop> = {
  NORMAL: 'HEALTHY',
  HARD: 'HARD',
  SOFT: 'SOFT',
  ABNORMAL: 'ABNORMAL',
  CAUTION: 'CAUTION',
  NONE: 'NONE',
};

function buildAttendanceRecordPayload(
  input: BuildAttendanceRecordPayloadInput
): AttendanceRecordPayload {
  const petId = Number(input.petId);

  if (!Number.isFinite(petId)) {
    throw new Error('유효하지 않은 petId 입니다.');
  }

  return {
    petId,
    date: input.date,
    condition: input.condition,
    snack: input.snack.trim(),
    poop: input.poop ? STOOL_STATUS_TO_POOP[input.poop] : null,
    poopMemo: input.poopMemo.trim(),
    note: input.note.trim(),
  };
}

export {
  buildAttendanceRecordPayload,
  type AttendanceRecordCondition,
  type AttendanceRecordPayload,
  type AttendanceRecordPoop,
  type BuildAttendanceRecordPayloadInput,
};
