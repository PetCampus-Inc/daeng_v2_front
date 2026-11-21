import { describe, expect, it } from 'vitest';

import { resolveSentryUserRole } from './sentryUserRole';

describe('resolveSentryUserRole', () => {
  it('clears the role until owner status is resolved', () => {
    expect(resolveSentryUserRole(false, true, false)).toBeUndefined();
  });

  it('tags the guardian view when an owner chose it', () => {
    expect(resolveSentryUserRole(true, true, true)).toBe('guardian');
  });

  it('tags the owner view only for an owner who did not choose guardian', () => {
    expect(resolveSentryUserRole(true, true, false)).toBe('owner');
    expect(resolveSentryUserRole(true, false, false)).toBe('guardian');
  });
});
