import { useQuery } from '@tanstack/react-query';

import { createPricingQueryOptions } from '@entities/pricing/config/pricingQueryKeys';
import { type PricingInfoResponse } from '@entities/pricing';

interface UsePricingQueryOptions {
  enabled?: boolean;
}

function usePricingQuery(id: string, options?: UsePricingQueryOptions) {
  return useQuery<PricingInfoResponse, Error>({
    ...createPricingQueryOptions(id),
    enabled: options?.enabled ?? Boolean(id),
  });
}

export { usePricingQuery };
