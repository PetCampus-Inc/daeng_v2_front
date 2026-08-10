const GUARDIAN_INVITE_RESULT_STATUS = Object.freeze({
  SUCCESS: 'success',
  INVALID_INVITE: 'invalid-invite',
  APPLICATION_FAILED: 'application-failed',
} as const);

type GuardianInviteResultStatus =
  (typeof GUARDIAN_INVITE_RESULT_STATUS)[keyof typeof GUARDIAN_INVITE_RESULT_STATUS];

const guardianInviteResultStatusValues = Object.values(
  GUARDIAN_INVITE_RESULT_STATUS
) as GuardianInviteResultStatus[];

function resolveGuardianInviteResultStatus(value: string | null): GuardianInviteResultStatus {
  return guardianInviteResultStatusValues.includes(value as GuardianInviteResultStatus)
    ? (value as GuardianInviteResultStatus)
    : GUARDIAN_INVITE_RESULT_STATUS.INVALID_INVITE;
}

export {
  GUARDIAN_INVITE_RESULT_STATUS,
  resolveGuardianInviteResultStatus,
  type GuardianInviteResultStatus,
};
