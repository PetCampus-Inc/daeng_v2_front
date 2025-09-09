import { suspend } from 'suspend-react';

import { loadNavermapsScript } from '../utils';

export function useNaverMaps() {
  if (typeof window === 'undefined') {
    throw new Error('useNaverMaps는 클라이언트에서만 사용할 수 있습니다.');
  }

  const clientId = 's5hu0lc2kz'; //process.env.NEXT_PUBLIC_NAVER_MAP_NCP_KEY;
  if (!clientId) {
    throw new Error("'NAVER_MAP_NCP_KEY' 값을 찾을 수 없습니다. .env 파일을 확인하세요.");
  }

  return suspend(loadNavermapsScript, [clientId, 'naver-map']);
}
