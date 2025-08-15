import { useMemo, useState } from 'react';
import { useBreedQuery } from './useBreedQuery';

export const useBreedSearch = () => {
  const { data: breeds = [], isLoading, error } = useBreedQuery();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBreeds = useMemo(() => {
    if (!searchTerm.trim()) return breeds;

    return breeds.filter((breed) => breed.breedName.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [breeds, searchTerm]);

  return {
    breeds: filteredBreeds,
    searchTerm,
    setSearchTerm,
    isLoading,
    error,
    totalCount: breeds.length,
    filteredCount: filteredBreeds.length,
  };
};
