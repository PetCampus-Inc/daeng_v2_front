const OWNER_HOME_QUERY_KEY = 'ownerHome';
const ownerHomeQueryKeys = {
  all: [OWNER_HOME_QUERY_KEY] as const,
  byUser: (userId?: string) => [...ownerHomeQueryKeys.all, userId] as const,
};
const ownerHomeQueryKey = ownerHomeQueryKeys.byUser;
export { OWNER_HOME_QUERY_KEY, ownerHomeQueryKeys, ownerHomeQueryKey };
