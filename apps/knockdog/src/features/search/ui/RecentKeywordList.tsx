import { Icon } from '@knockdog/ui';
import { InputChip } from './InputChip';
import { useSearchHistory } from '@shared/store';

export function RecentKeywordList() {
  const {
    // initialize,
    recentPlaces,
    recentSearchKeywords,
    removeRecentPlace,
    removeRecentSearchKeyword,
    clearRecentPlaces,
    clearRecentSearchKeywords,
  } = useSearchHistory();

  return (
    <>
      {/* 최근 찾아본 장소 섹션 */}
      <section className='bg-fill-secondary-0 gap-x4 mt-[34px] flex flex-col'>
        <div className='px-x4 flex items-center justify-between'>
          <h3 className='body1-extrabold text-text-primary'>최근 찾아본 장소</h3>
          <button onClick={clearRecentPlaces} className='caption1-semibold text-text-tertiary px-x2 py-x1'>
            전체 삭제
          </button>
        </div>
        {/* 최근 찾아본 장소 목록 */}
        <div className='gap-x2 scrollbar-hide px-x4 flex overflow-x-scroll'>
          {recentPlaces?.map((place) => (
            <div key={place.code} className='flex-shrink-0'>
              <InputChip name={place.label} onRemove={() => removeRecentPlace(place.code)} />
            </div>
          ))}
        </div>
      </section>

      {/* 최근 검색어 섹션 */}
      <section className='gap-x4 mt-[34px] flex flex-col px-[16px]'>
        <div className='bg-fill-secondary-0 py-x2 sticky top-0 z-10 -mx-[16px] flex items-center justify-between px-[16px]'>
          <h3 className='body1-extrabold text-text-primary'>최근 검색어</h3>
          <button onClick={clearRecentSearchKeywords} className='caption1-semibold text-text-tertiary px-x2 py-x1'>
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
                <Icon icon='Time' className='text-fill-secondary-400 size-x5' />
                {keyword.label}
              </a>
              <button onClick={() => removeRecentSearchKeyword(index)}>
                <Icon icon='Close' className='size-x5 text-fill-secondary-700' />
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
