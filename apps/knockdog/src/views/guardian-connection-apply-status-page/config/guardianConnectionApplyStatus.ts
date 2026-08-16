/**
 * View 레이어 호환 alias — 도메인 타입/상수는 `@entities/guardian-application` 기준.
 */
export {
  GUARDIAN_APPLICATION_GENDER as GUARDIAN_CONNECTION_APPLY_GENDER,
  GUARDIAN_APPLICATION_STATUS as GUARDIAN_CONNECTION_APPLY_STATUS,
  type GuardianApplication as GuardianConnectionApplyItem,
  type GuardianApplicationGender as GuardianConnectionApplyGender,
  type GuardianApplicationStatus as GuardianConnectionApplyStatus,
} from '@entities/guardian-application';
