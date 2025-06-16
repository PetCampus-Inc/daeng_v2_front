import { useState } from 'react';
import { DogSchoolList } from './DogSchoolList';
import { mockData } from '@entities/dogschool';

export function DogSchoolListWidget() {
  const [location, setLocation] = useState<'current' | 'home' | 'work'>(
    'current'
  );

  // TODO: 필터 기능 추가
  //   const {
  //     filterOptions: filters,
  //     selectedFilters,
  //     toggleFilter,
  //   } = useDogSchoolFilter(filterOptions);
  //   const selectedFilterIds = selectedFilters.map((filter) => filter.id);

  // TODO: 데이터 쿼리 추가
  //   const { data, isLoading, error } = useDogSchoolsQuery({
  //     location,
  //     filters: selectedFilterIds,
  //   });

  // TODO: 위치 기준 변경 추가
  //   const handleLocationChange = (newLocation: 'current' | 'home' | 'work') => {
  //     setLocation(newLocation);
  //   };

  return (
    <DogSchoolList
      data={mockData}
      selectedLocation={location}
      onLocationChange={setLocation}
      // onFilterToggle={toggleFilter}
    />
  );
}
