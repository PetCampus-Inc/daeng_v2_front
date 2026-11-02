import { USER_AGREEMENT_TERM, type UserAgreementTerm } from '@entities/user';
import { route } from '@shared/constants/route';

const requiredTermsConsentContent = {
  masterLabel: '이용을 위해 아래 항목에 동의해 주세요',
  submitLabel: '시작하기',
  items: [
    {
      id: USER_AGREEMENT_TERM.TERMS_OF_SERVICE,
      label: '[필수] 서비스 이용 약관',
      detailUrl: route.terms.service.root,
      legalDocumentKey: 'TERMS_OF_SERVICE',
    },
    {
      id: USER_AGREEMENT_TERM.PRIVACY_POLICY,
      label: '[필수] 개인정보 수집∙이용 동의',
      detailUrl: route.terms.privacy.root,
      legalDocumentKey: 'PRIVACY_POLICY',
    },
    {
      id: USER_AGREEMENT_TERM.AGE_OVER_14,
      label: '[필수] 만 14세 이상이에요',
    },
  ],
} as const satisfies {
  masterLabel: string;
  submitLabel: string;
  items: ReadonlyArray<{ id: UserAgreementTerm; label: string; detailUrl?: string; legalDocumentKey?: 'TERMS_OF_SERVICE' | 'PRIVACY_POLICY' }>;
};

type RequiredTermsConsentItemId = UserAgreementTerm;

export { requiredTermsConsentContent, type RequiredTermsConsentItemId };
