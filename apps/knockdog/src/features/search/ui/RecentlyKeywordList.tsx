import { Icon } from '@knockdog/ui';
import { InputChip } from './InputChip';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSearchHistory } from '@shared/store';
import { useStackNavigation } from '@shared/lib/bridge';

export function RecentlyKeywordList() {
  const {
    recentView,
    recentSearchKeywords,
    removeRecentView,
    removeRecentSearchKeyword,
    clearRecentViews,
    clearRecentSearchKeywords,
    addRecentSearchKeyword,
  } = useSearchHistory();

  const searchParams = useSearchParams();
  const { push } = useStackNavigation();
  const router = useRouter();

  const handleRecentViewClick = (id: string) => {
    push({ pathname: `kindergarten/${id}` });
  };

  const handleRecentKeywordClick = (keyword: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('query', keyword);
    params.set('bottomSheetSnapIndex', '1');

    addRecentSearchKeyword({
      type: 'USER_QUERY',
      label: keyword,
    });

    router.replace(`/?${params.toString()}`);
  };

  return (
    <>
      {/* 최근 찾아본 장소 섹션 */}
      <section className='bg-fill-secondary-0 gap-x4 mt-[34px] flex flex-col'>
        <div className='px-x4 flex items-center justify-between'>
          <h3 className='body1-extrabold text-text-primary'>최근 찾아본 장소</h3>
          <button onClick={clearRecentViews} className='caption1-semibold text-text-tertiary px-x2 py-x1'>
            전체 삭제
          </button>
        </div>
        {/* 최근 찾아본 장소 목록 */}
        <div className='gap-x2 scrollbar-hide px-x4 flex overflow-x-scroll'>
          {recentView?.map((place) => (
            <div key={place.id} className='shrink-0'>
              <InputChip
                name={place.label}
                onClick={() => handleRecentViewClick(place.id)}
                onRemove={() => removeRecentView(place.id)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 최근 검색어 섹션 */}
      <section className='gap-x4 mt-[34px] flex flex-col px-[16px]'>
        <div className='bg-fill-secondary-0 sticky top-0 z-10 -mx-[16px] flex items-center justify-between px-[16px]'>
          <h3 className='body1-extrabold text-text-primary'>최근 검색어</h3>
          <button onClick={clearRecentSearchKeywords} className='caption1-semibold text-text-tertiary px-x2 py-x1'>
            전체 삭제
          </button>
        </div>
        <div className='gap-x1 flex flex-col'>
          {recentSearchKeywords?.map((keyword, index) => (
            <a
              key={`${keyword.type}-${keyword.label}-${index}`}
              className='py-x2.5 hover:bg-fill-secondary-50 radius-r2 flex cursor-pointer items-center justify-between'
              onClick={() => handleRecentKeywordClick(keyword.label)}
            >
              <div className='body2-regular text-text-primary gap-x-x1 px-x2 py-x1 inline-flex flex-1 text-left'>
                <Icon icon='Time' className='text-fill-secondary-400 size-x5' />
                {keyword.label}
              </div>
              <span onClick={() => removeRecentSearchKeyword(index)} className='mr-x2 cursor-pointer'>
                <Icon icon='Close' className='size-x5 text-fill-secondary-700' />
              </span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
