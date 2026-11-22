import { useRouter, useSearchParams } from 'next/navigation';
import { Icon, TextField, TextFieldInput } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import { useSearchMachine } from '@features/kindergarten-map/model/useSearchMachine';
import { useBottomSheetSnapIndex } from '@shared/lib';
import { Header } from '@widgets/Header';

interface SearchHeaderProps {
  query: string;
}

export function SearchHeader({ query }: SearchHeaderProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { dispatch } = useSearchMachine();
  const { isFullExtended } = useBottomSheetSnapIndex();

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
      variant='transparent'
      className={cn(
        'absolute top-0 z-50 h-[calc(var(--top-bar-height)+var(--safe-area-inset-top,0px))] w-full pt-(--safe-area-inset-top,0px)',
        isFullExtended && 'bg-fill-secondary-0'
      )}
      innerClassName='gap-x-2'
    >
      <Header.LeftSection>
        <Header.BackButton className='text-fill-secondary-700 size-6' onClick={handleGoSearch} />
      </Header.LeftSection>

      <div className='relative min-w-0 flex-1'>
        <TextField
          prefix={<Icon icon='Search' className='size-x6 text-fill-secondary-700' />}
          className='bg-fill-secondary-0 border-line-600 h-x12 min-w-0 border shadow-[0px_1px_6px_rgba(16,24,40,0.12)]'
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
      </div>

      <Header.RightSection>
        <Header.CloseButton
          className='text-fill-secondary-700 size-6'
          onClick={handleClearQuery}
          aria-label='검색어 삭제'
        />
      </Header.RightSection>
    </Header>
  );
}
