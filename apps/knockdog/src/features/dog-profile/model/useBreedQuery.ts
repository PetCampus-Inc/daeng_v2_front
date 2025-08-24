import { useQuery } from '@tanstack/react-query';
import { Breed } from './breed.type';

export const useBreedQuery = () => {
  return useQuery<Breed[]>({
    queryKey: ['breed'],
    staleTime: 1000 * 60 * 60 * 24, // 24시간
    gcTime: 1000 * 60 * 60 * 24, // 24시간
    queryFn: async () => {
      try {
        const res = await fetch('/api/v0/breed', {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          console.warn('Breed API 를 불러오는데 실패했습니다:', res.status);
          return [];
        }

        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Breed API 를 불러오는데 실패했습니다:', error);
        return [];
      }
    },
  });
};
