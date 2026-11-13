import { useQuery } from '@tanstack/react-query';
import { toOwnerHome } from '../model/ownerHome';
import { getOwnerHome } from './ownerHome';
import { OWNER_HOME_QUERY_KEY, ownerHomeQueryKey } from '../config/ownerHomeQueryKeys';
interface UseOwnerHomeQueryOptions {
  userId?: string;
  enabled?: boolean;
}
const createHomeQueryOptions = ({ userId, enabled = true }: UseOwnerHomeQueryOptions = {}) => ({
  queryKey: ownerHomeQueryKey(userId),
  queryFn: getOwnerHome,
  select: (response: Awaited<ReturnType<typeof getOwnerHome>>) => toOwnerHome(response.data),
  enabled,
  staleTime: 0,
});
const useOwnerHomeQuery = (options: UseOwnerHomeQueryOptions = {}) => useQuery(createHomeQueryOptions(options));
export { OWNER_HOME_QUERY_KEY, ownerHomeQueryKey, useOwnerHomeQuery };
