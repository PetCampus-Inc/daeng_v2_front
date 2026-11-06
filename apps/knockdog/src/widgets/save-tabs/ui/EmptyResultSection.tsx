import React from 'react';
import { ActionButton } from '@knockdog/ui';
import { useTabNavigation } from '@shared/lib/bridge';

function EmptyResultSection({ searchQuery }: { searchQuery?: string }) {
  const { navigateToTab } = useTabNavigation();

  const handleSearch = () => {
    navigateToTab('/', searchQuery ? { query: searchQuery } : undefined);
  };

  return (
    <div className='flex flex-1 flex-col items-center justify-center'>
      <p className='h3-semibold mb-[30px] text-center'>
        {searchQuery ? (
          <>
            저장된 '<span className='h3-extrabold'>{searchQuery}</span>'이 없어요
          </>
        ) : (
          '검색 결과가 없어요!'
        )}
      </p>

      <ActionButton variant='tertiaryFill' size='medium' className='w-[126px]!' onClick={handleSearch}>
        탐색에서 검색
      </ActionButton>
    </div>
  );
}

export { EmptyResultSection };
