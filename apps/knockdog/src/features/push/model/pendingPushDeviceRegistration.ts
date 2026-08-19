const pendingPushDeviceRegistrations = new Set<Promise<void>>();
let pushDeviceLogoutInProgress = false;

/**
 * 로그아웃이 진행 중인 기기 등록 요청을 기다릴 수 있도록 추적한다.
 * 등록 성공 직후 로그아웃하면 반환된 ID를 로그아웃 요청에 포함해 서버에서 해제한다.
 */
function trackPendingPushDeviceRegistration(operation: Promise<void>) {
  pendingPushDeviceRegistrations.add(operation);
  void operation.finally(() => pendingPushDeviceRegistrations.delete(operation)).catch(() => undefined);
  return operation;
}

async function waitForPendingPushDeviceRegistration() {
  // 대기 중 새 요청이 추가될 수 있으므로, 모두 정리될 때까지 반복한다.
  while (pendingPushDeviceRegistrations.size) {
    await Promise.allSettled([...pendingPushDeviceRegistrations]);
  }
}

function beginPushDeviceLogout() {
  pushDeviceLogoutInProgress = true;
}

function endPushDeviceLogout() {
  pushDeviceLogoutInProgress = false;
}

function isPushDeviceLogoutInProgress() {
  return pushDeviceLogoutInProgress;
}

export {
  beginPushDeviceLogout,
  endPushDeviceLogout,
  isPushDeviceLogoutInProgress,
  trackPendingPushDeviceRegistration,
  waitForPendingPushDeviceRegistration,
};
