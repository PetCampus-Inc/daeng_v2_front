import { useState } from 'react';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

function useRoleConversionCompletePage() {
  const { reset } = useStackNavigation();
  const [isInviteActive, setIsInviteActive] = useState(false);

  const handleInviteClick = () => {
    // @todo 보호자 초대 플로우 연결
    setIsInviteActive(true);
  };

  const handleSkipClick = () => {
    reset(route.root);
  };

  return {
    isInviteActive,
    handleInviteClick,
    handleSkipClick,
  };
}

export { useRoleConversionCompletePage };
