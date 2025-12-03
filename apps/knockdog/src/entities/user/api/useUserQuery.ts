import { useQuery } from '@tanstack/react-query';
import { getUserInfo } from './user';

const useUserInfoQuery = () => {
  return useQuery({
    queryKey: ['userInfo'],
    queryFn: getUserInfo,
    select: (data) => data.data,
  });
};

export { useUserInfoQuery };
