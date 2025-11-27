import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { searchAddress } from './searchAddress';

const useSearchAddressQuery = (query: string) => {
  return useQuery({
    queryKey: ['address', query],
    queryFn: () => searchAddress(query),
    enabled: !!query,
    placeholderData: keepPreviousData,
    select: ({ data }) => data?.addressList ?? [],
  });
};

export { useSearchAddressQuery };
