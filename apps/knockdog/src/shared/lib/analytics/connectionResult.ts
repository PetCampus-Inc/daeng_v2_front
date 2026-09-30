'use client';

interface ConnectionResultCandidate {
  id: string;
  status: string;
}

/**
 * T-08은 서버 상태 전이가 확정된 액션에서만 connection_status를 남긴다.
 * 신청 현황 화면 조회는 같은 전이를 다시 세지 않는다.
 */
function trackConnectionResultsOnce(_applications: ConnectionResultCandidate[] | null | undefined) {}

function useTrackConnectionResults(_applications: ConnectionResultCandidate[] | null | undefined) {}

export { trackConnectionResultsOnce, useTrackConnectionResults };
