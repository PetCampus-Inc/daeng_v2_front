import { useQuery } from '@tanstack/react-query';

import { createPricingQueryOptions } from '@entities/pricing/config/pricingQueryKeys';
import { type PricingInfoResponse } from '@entities/pricing';

function usePricingQuery(id: string) {
  return useQuery<PricingInfoResponse, Error>({
    ...createPricingQueryOptions(id),
  });
}

export { usePricingQuery };
