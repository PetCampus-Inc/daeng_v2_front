import type { GuardianDisconnectEligibility } from '@entities/guardian-home';

const GUARDIAN_DISCONNECT_JUDGEMENT = {
  proceed: 'proceed',
  todayAttendance: 'todayAttendance',
  tickets: 'tickets',
  reservation: 'reservation',
} as const;

type GuardianDisconnectJudgement =
  (typeof GUARDIAN_DISCONNECT_JUDGEMENT)[keyof typeof GUARDIAN_DISCONNECT_JUDGEMENT];

/**
 * 해제 가능 여부 응답으로 어떤 안내를 보여 줄지 정한다.
 * 우선순위: 오늘 등원 기록 → 이용권 → 예약. 이유가 없으면 해제를 진행한다.
 */
const judgeGuardianDisconnect = (eligibility: GuardianDisconnectEligibility): GuardianDisconnectJudgement => {
  if (eligibility.hasTodayAttendance) return GUARDIAN_DISCONNECT_JUDGEMENT.todayAttendance;
  if (eligibility.canDisconnect) return GUARDIAN_DISCONNECT_JUDGEMENT.proceed;
  if (eligibility.tickets.length > 0) return GUARDIAN_DISCONNECT_JUDGEMENT.tickets;
  if (eligibility.reservation) return GUARDIAN_DISCONNECT_JUDGEMENT.reservation;
  return GUARDIAN_DISCONNECT_JUDGEMENT.proceed;
};

export { GUARDIAN_DISCONNECT_JUDGEMENT, judgeGuardianDisconnect };
export type { GuardianDisconnectJudgement };
