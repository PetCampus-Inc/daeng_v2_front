import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useBasePoint } from '@entities/user';
import type { AutocompletePlace } from '@entities/kindergarten';
import { searchQueryOptions } from '@features/search';

function useKindergartenSearchPage() {
  const [query, setQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<AutocompletePlace | null>(null);

  const { coord } = useBasePoint();
  const trimmedQuery = query.trim();

  const { data } = useQuery({
    ...searchQueryOptions.autocomplete({ query: trimmedQuery, coord }),
  });

  const places = data?.place ?? [];

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setSelectedPlace(null);
  };

  const handlePlaceSelect = (place: AutocompletePlace) => {
    setSelectedPlace(place);
    // @todo 3단계 개인정보 수집 및 이용 동의 라우팅 (26-06-20)
  };

  return {
    query,
    places,
    selectedPlaceId: selectedPlace?.id ?? null,
    handleQueryChange,
    handlePlaceSelect,
  };}

export { useKindergartenSearchPage };
