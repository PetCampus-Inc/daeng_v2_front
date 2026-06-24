import { useState } from 'react';

import { useMutation } from '@tanstack/react-query';

function usePrivacyConsentPage() {
  const [isAgreed, setIsAgreed] = useState(false);

  const { mutate: submitConsent, isPending } = useMutation({
    // @todo BE API 연동 (POST .../owner-verification/submit)
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
  });

  const handleSubmit = () => {
    submitConsent();
  };

  return {
    isAgreed,
    isSubmitEnabled: isAgreed,
    isSubmitPending: isPending,
    handleAgreedChange: setIsAgreed,
    handleSubmit,
  };
}

export { usePrivacyConsentPage };
