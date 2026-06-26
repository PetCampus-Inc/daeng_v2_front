import { useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { getKindergartenMain, type AutocompletePlace } from '@entities/kindergarten';
import { useBasePoint } from '@entities/user';
import { searchQueryOptions } from '@features/search';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

import { saveSearchPrefill } from '@views/role-conversion/model/kindergartenConfirmParams';

function useKindergartenSearchPage() {
  const { push } = useStackNavigation();
  const [query, setQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<AutocompletePlace | null>(null);
  const isSelectingPlaceRef = useRef(false);

  const { coord } = useBasePoint();
  const trimmedQuery = query.trim();

  const { data, isFetching, isFetched } = useQuery({
    ...searchQueryOptions.autocomplete({ query: trimmedQuery, coord }),
  });

  const { mutate: selectPlace, isPending: isPlaceSelectPending } = useMutation({
    mutationFn: async (place: AutocompletePlace) => {
      const main = await getKindergartenMain({
        id: place.id,
        lng: place.coord.lng,
        lat: place.coord.lat,
      });

      return { place, phoneNumber: main.phoneNumber };
    },
    onSuccess: ({ place, phoneNumber }) => {
      const searchPrefill = {
        placeId: place.id,
        name: place.title,
        address: place.roadAddress,
        kindergartenNumber: phoneNumber,
      };

      saveSearchPrefill(searchPrefill);

      push({
        pathname: route.roleConversion.kindergartenRegister.root,
        query: { mode: 'search', reset: place.id },
        params: { searchPrefill },
      });
    },
  });

  const places = data?.place ?? [];
  const isSearchEmpty = trimmedQuery.length > 0 && isFetched && !isFetching && places.length === 0;

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setSelectedPlace(null);
  };

  const handlePlaceSelect = (place: AutocompletePlace) => {
    if (isPlaceSelectPending || isSelectingPlaceRef.current) return;

    isSelectingPlaceRef.current = true;
    setSelectedPlace(place);
    selectPlace(place, {
      onSettled: () => {
        isSelectingPlaceRef.current = false;
      },
    });
  };

  return {
    query,
    places,
    selectedPlaceId: selectedPlace?.id ?? null,
    isSearchEmpty,
    isPlaceSelectPending,
    handleQueryChange,
    handlePlaceSelect,
  };
}

export { useKindergartenSearchPage };
