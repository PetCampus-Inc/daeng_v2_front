import { useRouter, useSearchParams } from 'next/navigation';
import { Icon, TextField, TextFieldInput } from '@knockdog/ui';

import { useSearchMachine } from '@features/kindergarten-map/model/useSearchMachine';
import { Header } from '@widgets/Header';

interface SearchHeaderProps {
  query: string;
}

export function SearchHeader({ query }: SearchHeaderProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { dispatch } = useSearchMachine();

  /**
   * 검색창 재활성화 (검색 페이지로 이동)
   */
  const handleGoSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    router.replace(`/search?${params.toString()}`);
  };

  /**
   * 검색어만 삭제 — 현재 지도/메인 페이지에 유지
   */
  const handleClearQuery = () => {
    dispatch({ type: 'CLEAR_QUERY' });
  };

  return (
    <Header
      className='bg-fill-secondary-0 absolute top-0 z-50 h-fit w-full pt-(--safe-area-inset-top,0px)'
      innerClassName='gap-2'
    >
      <Header.LeftSection>
        <Header.BackButton onClick={handleGoSearch} />
      </Header.LeftSection>

      <TextField
        prefix={<Icon icon='Search' className='size-x6 text-fill-secondary-700' />}
        className='bg-fill-secondary-50 h-x12 border-0'
        onClick={handleGoSearch}
      >
        <TextFieldInput
          type='search'
          placeholder='업체 또는 주소를 검색하세요'
          aria-label='검색어 입력'
          autoFocus
          value={query}
          readOnly
        />
      </TextField>

      <Header.RightSection>
        <Header.CloseButton onClick={handleClearQuery} aria-label='검색어 삭제' />
      </Header.RightSection>
    </Header>
  );
}
