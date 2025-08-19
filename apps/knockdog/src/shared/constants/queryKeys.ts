const basePoint = {
  all: ['basePoint'] as const,
  current: () => [...basePoint.all, 'current'] as const,
  home: () => [...basePoint.all, 'home'] as const,
  work: () => [...basePoint.all, 'work'] as const,
  type: (type: 'current' | 'home' | 'work') => [...basePoint.all, type] as const,
};

export const globalQueryKeys = {
  basePoint,
} as const;
