import { BUSINESS_REGISTRATION_VERIFY_CODE } from '@entities/business-registration';
import { ApiError } from '@shared/api';

import {
  RESULT_STATUS,
  type ResultStatus,
} from '@views/role-conversion/complete/config/roleConversionResultStatus';

/** 원장 인증 API — response.code (message key) */
export const OWNER_VERIFICATION_MESSAGE_KEY = Object.freeze({
  UNAUTHORIZED: 'OWNER_VERIFICATION-401-1',
  KINDERGARTEN_NOT_FOUND: 'OWNER_VERIFICATION-404-1',
  VERIFICATION_NOT_FOUND: 'OWNER_VERIFICATION-404-2',
  PRIVACY_CONSENT_REQUIRED: 'OWNER_VERIFICATION-400-1',
  BIZ_INVALID: 'OWNER_VERIFICATION-400-2',
  SCHOOL_ALREADY_HAS_OWNER: 'OWNER_VERIFICATION-409-2',
  SCHOOL_DUPLICATED: 'OWNER_VERIFICATION-409-3',
  INVALID_STATUS: 'OWNER_VERIFICATION-409-4',
  IN_PROGRESS: 'OWNER_VERIFICATION-409-5',
  BIZ_DUPLICATED: 'OWNER_VERIFICATION-409-6',
} as const);

const duplicateErrorCodes = new Set<string>([
  OWNER_VERIFICATION_MESSAGE_KEY.SCHOOL_ALREADY_HAS_OWNER,
  OWNER_VERIFICATION_MESSAGE_KEY.SCHOOL_DUPLICATED,
  OWNER_VERIFICATION_MESSAGE_KEY.BIZ_DUPLICATED,
  BUSINESS_REGISTRATION_VERIFY_CODE.DUPLICATE,
]);

const closedOrSuspendedErrorCodes = new Set<string>([BUSINESS_REGISTRATION_VERIFY_CODE.CLOSED_OR_SUSPENDED]);

const sessionClearErrorCodes = new Set<string>([
  OWNER_VERIFICATION_MESSAGE_KEY.IN_PROGRESS,
  OWNER_VERIFICATION_MESSAGE_KEY.INVALID_STATUS,
]);

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

export function shouldClearOwnerVerificationSession(error: unknown): boolean {
  return error instanceof ApiError && sessionClearErrorCodes.has(error.code);
}

