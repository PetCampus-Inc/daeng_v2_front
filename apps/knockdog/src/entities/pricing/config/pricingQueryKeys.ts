import { getPricing } from '../api/pricing';

const pricingQueryKeys = {
  all: ['pricing'] as const,
  byId: (id: string) => [...pricingQueryKeys.all, id] as const,
} as const;

const createPricingQueryOptions = (id: string) => ({
  queryKey: pricingQueryKeys.byId(id),
  queryFn: () => getPricing(id),
});

export { pricingQueryKeys, createPricingQueryOptions };
