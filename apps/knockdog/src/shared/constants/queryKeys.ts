export const globalQueryKeys = {
  basePoint: {
    all: ['basePoint'] as const,
    current: () => [...globalQueryKeys.basePoint.all, 'current'] as const,
    home: () => [...globalQueryKeys.basePoint, 'home'] as const,
    work: () => [...globalQueryKeys.basePoint, 'work'] as const,
    type: (type: 'current' | 'home' | 'work') => [...globalQueryKeys.basePoint, type] as const,
  },
};
