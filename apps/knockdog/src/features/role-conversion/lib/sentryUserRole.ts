function resolveSentryUserRole(isResolved: boolean, isOwner: boolean, prefersGuardianView: boolean) {
  if (!isResolved) return undefined;
  return isOwner && !prefersGuardianView ? 'owner' : 'guardian';
}

export { resolveSentryUserRole };
