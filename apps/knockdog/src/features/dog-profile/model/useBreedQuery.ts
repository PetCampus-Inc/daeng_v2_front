import { useQuery } from '@tanstack/react-query';
import { Breed } from './breed.type';
import { api, type ApiResponse } from '@shared/api';

export const useBreedQuery = (searchText: string) => {
  const normalizedSearchText = searchText.trim();

  return useQuery<Breed[]>({
    queryKey: ['breed', normalizedSearchText],
    staleTime: 1000 * 60 * 60 * 24, // 24시간
    gcTime: 1000 * 60 * 60 * 24, // 24시간
    queryFn: async () => {
      const response = await api
        .get('breed-catalog', { searchParams: normalizedSearchText ? { searchText: normalizedSearchText } : {} })
        .json<ApiResponse<Breed[]>>();
      return response.data ?? [];
    },
  });
};
