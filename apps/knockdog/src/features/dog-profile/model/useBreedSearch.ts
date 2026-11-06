import { useState } from 'react';
import { useBreedQuery } from './useBreedQuery';
import { useDebounced } from '@shared/lib';

export const useBreedSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounced(searchTerm, 200);
  const { data: breeds = [], isLoading, error } = useBreedQuery(debouncedSearchTerm);

  return {
    breeds,
    searchTerm,
    setSearchTerm,
    isLoading,
    error,
    totalCount: breeds.length,
    filteredCount: breeds.length,
  };
};
