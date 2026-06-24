'use client';

import { ActionButton } from '@knockdog/ui';

import { roleConversionProgress } from '@views/role-conversion/config/roleConversionProgress';
import { InlineAgreementConsent } from '@views/role-conversion/ui/InlineAgreementConsent';
import { RoleConversionPrivacy } from '@views/role-conversion/ui/RoleConversionPrivacy';

import { privacyConsentContent } from '@views/role-conversion/privacy-consent/config/privacyConsentContent';
import { privacyConsentPolicyBody } from '@views/role-conversion/privacy-consent/config/privacyConsentPolicy';
import { usePrivacyConsentPage } from '@views/role-conversion/privacy-consent/model/usePrivacyConsentPage';

function PrivacyConsentPage() {
  const { isAgreed, isSubmitEnabled, handleAgreedChange, handleSubmit } = usePrivacyConsentPage();

  return (
    <RoleConversionPrivacy
      headerTitle={privacyConsentContent.headerTitle}
      step={roleConversionProgress.privacyConsentStep}
      titleLine1={privacyConsentContent.titleLine1}
      titleLine2={privacyConsentContent.titleLine2}
      footer={
        <ActionButton
          type='button'
          variant='secondaryFill'
          size='large'
          className='w-full'
          disabled={!isSubmitEnabled}
          onClick={handleSubmit}
        >
          {privacyConsentContent.submitButtonLabel}
        </ActionButton>
      }
    >
      <InlineAgreementConsent
        label={privacyConsentContent.agreementLabel}
        policyBody={privacyConsentPolicyBody}
        checked={isAgreed}
        onCheckedChange={handleAgreedChange}
      />
    </RoleConversionPrivacy>
  );
}

export { PrivacyConsentPage };
