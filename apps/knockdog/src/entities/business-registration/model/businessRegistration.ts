interface VerifyRequest {
  registrationNumber: string;
}

interface VerifyData {
  valid: boolean;
  code: string;
  message: string;
}

/** POST admin/business-registration/verify — data.code */
const BUSINESS_REGISTRATION_VERIFY_CODE = Object.freeze({
  SUCCESS: 'M-11',
  INVALID_FORMAT: 'E-03',
  DUPLICATE: 'E-04',
  CLOSED_OR_SUSPENDED: 'E-05',
  LOOKUP_FAILED: 'E-06',
} as const);

export { BUSINESS_REGISTRATION_VERIFY_CODE, type VerifyData, type VerifyRequest };
