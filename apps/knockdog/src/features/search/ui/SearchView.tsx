import { useRouter } from 'next/navigation';
import { Icon, TextField, TextFieldInput } from '@knockdog/ui';
import { InputChip } from './InputChip';
import { useSearchHistory } from '@shared/store';

export default function SearchView({
  inputRef,
}: {
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const {
    // initialize,
    recentPlaces,
    recentSearchKeywords,
    removeRecentPlace,
    removeRecentSearchKeyword,
    clearRecentPlaces,
    clearRecentSearchKeywords,
  } = useSearchHistory();

  // TODO: 최근 찾아본 장소 및 검색어 가져오기 로직 변경
  // useEffect(() => {
  //   // 로컬스토리지에서 최근 찾아본 장소 및 검색어 가져오기
  //   initialize();
  // }, [initialize]);

  return (
    <div className='bg-fill-secondary-0 flex h-full flex-col'>
      {/* 검색창 헤더 */}
      <div className='py-x2 pr-x4 pl-x2 gap-x-x2 pt-[calc(env(safe-area-inset-top) + 8px)] flex shrink-0'>
        <button onClick={handleBack} className='px-x2 shrink-0'>
          <Icon icon='ChevronLeft' className='size-x6' />
        </button>
        <TextField
          prefix={
            <Icon icon='Search' className='size-x6 text-fill-secondary-700' />
          }
          className='bg-fill-secondary-50 h-x12 border-0'
        >
          <TextFieldInput
            ref={inputRef}
            type='text'
            placeholder='업체 또는 주소를 검색하세요'
            autoFocus
          />
        </TextField>
      </div>

      <main className='flex-1 overflow-y-auto'>
        {/* 최근 찾아본 장소 섹션 */}
        <section className='bg-fill-secondary-0 gap-x4 mt-[34px] flex flex-col'>
          <div className='px-x4 flex items-center justify-between'>
            <h3 className='body1-extrabold text-text-primary'>
              최근 찾아본 장소
            </h3>
            <button
              onClick={clearRecentPlaces}
              className='caption1-semibold text-text-tertiary px-x2 py-x1'
            >
              전체 삭제
            </button>
          </div>
          {/* 최근 찾아본 장소 목록 */}
          <div className='gap-x2 scrollbar-hide px-x4 flex overflow-x-scroll'>
            {recentPlaces?.map((place) => (
              <div key={place.code} className='flex-shrink-0'>
                <InputChip
                  name={place.label}
                  onRemove={() => removeRecentPlace(place.code)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* 최근 검색어 섹션 */}
        <section className='gap-x4 mt-[34px] flex flex-col px-[16px]'>
          <div className='bg-fill-secondary-0 py-x2 sticky top-0 z-10 -mx-[16px] flex items-center justify-between px-[16px]'>
            <h3 className='body1-extrabold text-text-primary'>최근 검색어</h3>
            <button
              onClick={clearRecentSearchKeywords}
              className='caption1-semibold text-text-tertiary px-x2 py-x1'
            >
              전체 삭제
            </button>
          </div>
          <div className='gap-x2 flex flex-col'>
            {recentSearchKeywords?.map((keyword, index) => (
              <div
                key={`${keyword.type}-${keyword.label}-${index}`}
                className='gap-x py-x2.5 flex items-center justify-between'
              >
                <a className='body2-regular text-text-primary gap-x-x1 inline-flex flex-1'>
                  <Icon
                    icon='Time'
                    className='text-fill-secondary-400 size-x5'
                  />
                  {keyword.label}
                </a>
                <button onClick={() => removeRecentSearchKeyword(index)}>
                  <Icon
                    icon='Close'
                    className='size-x5 text-fill-secondary-700'
                  />
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
