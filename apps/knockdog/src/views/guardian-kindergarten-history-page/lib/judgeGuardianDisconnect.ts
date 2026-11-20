import type { GuardianDisconnectEligibility } from '@entities/guardian-home';

const GUARDIAN_DISCONNECT_JUDGEMENT = {
  proceed: 'proceed',
  tickets: 'tickets',
  reservation: 'reservation',
  blocked: 'blocked',
} as const;

type GuardianDisconnectJudgement = (typeof GUARDIAN_DISCONNECT_JUDGEMENT)[keyof typeof GUARDIAN_DISCONNECT_JUDGEMENT];

/**
 * 해제 가능 여부 응답으로 어떤 안내를 보여 줄지 정한다.
 * canDisconnect만 해제 여부를 결정한다. false이면 사유가 없어도 차단한다.
 */
const judgeGuardianDisconnect = (eligibility: GuardianDisconnectEligibility): GuardianDisconnectJudgement => {
  if (eligibility.canDisconnect) return GUARDIAN_DISCONNECT_JUDGEMENT.proceed;
  if (eligibility.tickets.length > 0) return GUARDIAN_DISCONNECT_JUDGEMENT.tickets;
  if (eligibility.reservation) return GUARDIAN_DISCONNECT_JUDGEMENT.reservation;
  return GUARDIAN_DISCONNECT_JUDGEMENT.blocked;
};

export { GUARDIAN_DISCONNECT_JUDGEMENT, judgeGuardianDisconnect };
export type { GuardianDisconnectJudgement };
