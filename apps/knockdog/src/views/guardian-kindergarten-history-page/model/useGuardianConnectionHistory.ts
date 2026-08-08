'use client';

import { useMemo } from 'react';

import { MOCK_CONNECTION_HISTORY } from '../config/guardianConnectionHistoryMock';
import { sortGuardianConnectionHistory } from '../lib/sortGuardianConnectionHistory';

/** API 연동 전 연결 이력 mock */
function useGuardianConnectionHistory() {
  const items = useMemo(() => sortGuardianConnectionHistory(MOCK_CONNECTION_HISTORY), []);

  return { items };
}

export { useGuardianConnectionHistory };
