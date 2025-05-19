import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Fetch } from '@utils/fetch';
import { postsKeys } from '@constants/queryKeys/postKey';
import { AxiosError } from 'axios';

import { Params, Post, APIResponse } from 'types/post';

export const usePosts = (
  params: Params,
  options?: UseQueryOptions<
    APIResponse<Post[]>, // fetcher 리턴값
    AxiosError, // error
    Post[], // select 후 리턴값
    ReturnType<typeof postsKeys.list> // queryKey 타입: 정확히 맞춰줌
  >
) => {
  return useQuery<
    APIResponse<Post[]>,
    AxiosError,
    Post[],
    ReturnType<typeof postsKeys.list>
  >({
    queryKey: postsKeys.list(params),
    queryFn: () =>
      Fetch<APIResponse<Post[]>>(
        `https://jsonplaceholder.typicode.com/posts${params.userId ? `?userId=${params.userId}` : ''}`
        //임의로 막 적음, api함수로 분리해서 호출할 것
      ),
    select: (res) => res.result,
    ...options,
  });
};
