import { useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

function usePrivacyConsentPage() {
  const { reset } = useStackNavigation();
  const [isAgreed, setIsAgreed] = useState(false);

  const { mutate: submitConsent, isPending } = useMutation({
    // @todo BE API 연동 (POST .../owner-verification/privacy-consent)
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      reset(route.root);
    },
  });

  const handleSubmit = () => {
    submitConsent();
  };

  return {
    isAgreed,
    isSubmitEnabled: isAgreed && !isPending,
    isSubmitPending: isPending,
    handleAgreedChange: setIsAgreed,
    handleSubmit,
  };
}

export { usePrivacyConsentPage };
