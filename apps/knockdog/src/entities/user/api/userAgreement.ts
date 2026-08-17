import { api, type ApiResponse } from '@shared/api';

interface UserAgreementsStatus {
  hasAgreedRequiredTerms: boolean;
}

const USER_AGREEMENT_TERM = {
  TERMS_OF_SERVICE: 'TERMS_OF_SERVICE',
  PRIVACY_POLICY: 'PRIVACY_POLICY',
  AGE_OVER_14: 'AGE_OVER_14',
} as const;

type UserAgreementTerm = (typeof USER_AGREEMENT_TERM)[keyof typeof USER_AGREEMENT_TERM];

interface CreateUserAgreementsRequest {
  agreedTerms: UserAgreementTerm[];
}

/** `POST` - 필수 약관 동의 처리 */
function postUserAgreements(request: CreateUserAgreementsRequest) {
  return api
    .post('user/agreements', { json: request })
    .json<ApiResponse<Record<string, never>>>();
}

/** `GET` - 필수 약관 동의 여부 조회 */
function getUserAgreementsStatus() {
  return api.get('user/agreements/status').json<ApiResponse<UserAgreementsStatus>>();
}

export {
  USER_AGREEMENT_TERM,
  getUserAgreementsStatus,
  postUserAgreements,
  type CreateUserAgreementsRequest,
  type UserAgreementsStatus,
  type UserAgreementTerm,
};
