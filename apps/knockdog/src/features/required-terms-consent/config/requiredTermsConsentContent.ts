import { USER_AGREEMENT_TERM, type UserAgreementTerm } from '@entities/user';
import { EXTERNAL_LINKS } from '@shared/constants/external-links';

const requiredTermsConsentContent = {
  masterLabel: '이용을 위해 아래 항목에 동의해 주세요',
  submitLabel: '시작하기',
  items: [
    {
      id: USER_AGREEMENT_TERM.TERMS_OF_SERVICE,
      label: '[필수] 서비스 이용 약관',
      detailUrl: EXTERNAL_LINKS.TERMS_OF_SERVICE,
    },
    {
      id: USER_AGREEMENT_TERM.PRIVACY_POLICY,
      label: '[필수] 개인정보 수집∙이용 동의',
      detailUrl: EXTERNAL_LINKS.PRIVACY_POLICY,
    },
    {
      id: USER_AGREEMENT_TERM.AGE_OVER_14,
      label: '[필수] 만 14세 이상이에요',
    },
  ],
} as const satisfies {
  masterLabel: string;
  submitLabel: string;
  items: ReadonlyArray<{ id: UserAgreementTerm; label: string; detailUrl?: string }>;
};

type RequiredTermsConsentItemId = UserAgreementTerm;

export { requiredTermsConsentContent, type RequiredTermsConsentItemId };
