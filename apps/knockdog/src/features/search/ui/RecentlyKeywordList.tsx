import { Icon } from '@knockdog/ui';
import { InputChip } from './InputChip';
import { RecentSearchKeywordSection } from './RecentSearchKeywordSection';
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

      <RecentSearchKeywordSection
        keywords={(recentSearchKeywords ?? []).map((keyword) => keyword.label)}
        onSelect={handleRecentKeywordClick}
        onRemove={removeRecentSearchKeyword}
        onClearAll={clearRecentSearchKeywords}
      />
    </>
  );
}
