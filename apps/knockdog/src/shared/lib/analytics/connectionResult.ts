'use client';

import { useEffect } from 'react';

import { STORAGE_KEYS } from '@shared/constants';
import { TypedStorage } from '@shared/lib/storage';

import type { ConnectionResultStatus } from './gaEvents';
import { trackConnectionResult } from './gaEvents';

type ConnectionResultTrackedMap = Record<string, ConnectionResultStatus>;

const connectionResultTrackedStorage = new TypedStorage<ConnectionResultTrackedMap>(
  STORAGE_KEYS.CONNECTION_RESULT_TRACKED_BY_APPLICATION
);

interface ConnectionResultCandidate {
  id: string;
  status: string;
}

function readTrackedMap(): ConnectionResultTrackedMap {
  const stored = connectionResultTrackedStorage.get();
  if (!stored || typeof stored !== 'object') return {};
  return stored;
}

function toConnectionResultStatus(status: string): ConnectionResultStatus | null {
  if (status === 'active') return 'approve';
  if (status === 'rejected') return 'reject';
  return null;
}

/** 신청 건당 승인/거절 결과를 보호자 기준으로 1회만 기록한다. */
function trackConnectionResultsOnce(applications: ConnectionResultCandidate[] | null | undefined) {
  if (!applications?.length) return;

  const tracked = readTrackedMap();
  let hasChange = false;

  for (const application of applications) {
    const resultStatus = toConnectionResultStatus(application.status);
    if (!resultStatus) continue;
    if (tracked[application.id]) continue;

    tracked[application.id] = resultStatus;
    hasChange = true;
    trackConnectionResult({ status: resultStatus });
  }

  if (hasChange) {
    connectionResultTrackedStorage.set(tracked);
  }
}

function useTrackConnectionResults(applications: ConnectionResultCandidate[] | null | undefined) {
  useEffect(() => {
    trackConnectionResultsOnce(applications);
  }, [applications]);
}

export { trackConnectionResultsOnce, useTrackConnectionResults };
