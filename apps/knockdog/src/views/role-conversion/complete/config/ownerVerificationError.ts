import { BUSINESS_VERIFICATION_ERROR_CODE } from '@views/role-conversion/business-verification/config/businessVerificationError';
import { RESULT_STATUS, type ResultStatus } from '@views/role-conversion/complete/config/roleConversionResultStatus';

import { ApiError } from '@shared/api';

/** POST /api/v0/admin/owner-verification/submit 에서 발생하는 ErrorCode */
export const SUBMIT_ERROR_CODE = Object.freeze({
  UNAUTHORIZED: 'OWNER_VERIFICATION_UNAUTHORIZED',
  ALREADY_OWNER: 'OWNER_VERIFICATION_ALREADY_OWNER',
  NOT_FOUND: 'OWNER_VERIFICATION_NOT_FOUND',
  PRIVACY_CONSENT_REQUIRED: 'OWNER_VERIFICATION_PRIVACY_CONSENT_REQUIRED',
  IN_PROGRESS: 'OWNER_VERIFICATION_IN_PROGRESS',
  INVALID_STATUS: 'OWNER_VERIFICATION_INVALID_STATUS',
  SCHOOL_HAS_OWNER: 'OWNER_VERIFICATION_SCHOOL_ALREADY_HAS_OWNER',
  BIZ_INVALID: 'OWNER_VERIFICATION_BUSINESS_REGISTRATION_INVALID',
  BIZ_DUPLICATED: 'OWNER_VERIFICATION_BUSINESS_REGISTRATION_DUPLICATED',
} as const);

const duplicateErrorCodes = new Set<string>([
  BUSINESS_VERIFICATION_ERROR_CODE.DUPLICATE,
  SUBMIT_ERROR_CODE.BIZ_DUPLICATED,
  SUBMIT_ERROR_CODE.SCHOOL_HAS_OWNER,
]);

const closedOrSuspendedErrorCodes = new Set<string>([BUSINESS_VERIFICATION_ERROR_CODE.CLOSED_OR_SUSPENDED]);

/** 사업자등록번호 verify + submit API 공통 에러 → 결과 화면 status */
export function mapRoleConversionErrorToStatus(error: unknown): ResultStatus {
  if (!(error instanceof ApiError)) {
    return RESULT_STATUS.TEMPORARY;
  }

  if (duplicateErrorCodes.has(error.code)) {
    return RESULT_STATUS.DUPLICATE;
  }

  if (closedOrSuspendedErrorCodes.has(error.code)) {
    return RESULT_STATUS.CLOSED_OR_SUSPENDED;
  }

  return RESULT_STATUS.TEMPORARY;
}

/** @deprecated mapRoleConversionErrorToStatus 사용 */
export const mapSubmitErrorToStatus = mapRoleConversionErrorToStatus;
