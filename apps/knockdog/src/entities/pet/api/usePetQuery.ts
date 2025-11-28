import { useQuery } from '@tanstack/react-query';
import { getPetList } from './pet';
import type { Pet } from '../model/pet';

const usePetListQuery = () => {
  return useQuery({
    queryKey: ['petList'],
    queryFn: getPetList,
    select: (data) => ({
      ...data,
      data: data.data?.sort((a, b) => (b.isRepresentative ? 1 : 0) - (a.isRepresentative ? 1 : 0)),
    }),
  });
};

const usePetByIdQuery = (petId: string) => {
  return useQuery({
    queryKey: ['petList'],
    queryFn: getPetList,
    select: (petList) => petList.data?.find((p) => String(p.id) === petId),
  });
};

// 대표 강아지 조회
const usePetRepresentativeQuery = () => {
  return useQuery({
    queryKey: ['petList'],
    queryFn: getPetList,
    select: (petList) => petList.data?.find((p) => p.isRepresentative),
  });
};

export { usePetListQuery, usePetByIdQuery, usePetRepresentativeQuery };
