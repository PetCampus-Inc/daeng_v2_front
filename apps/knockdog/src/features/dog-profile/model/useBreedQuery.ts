import { useQuery } from '@tanstack/react-query';
import { Breed } from './breed.type';
import { api } from '@shared/api';

export const useBreedQuery = () => {
  return useQuery<Breed[]>({
    queryKey: ['breed'],
    staleTime: 1000 * 60 * 60 * 24, // 24시간
    gcTime: 1000 * 60 * 60 * 24, // 24시간
    queryFn: async () => {
      const res = await api.get('breed').json<Breed[]>();
      return res ?? [];
    },
  });
};
