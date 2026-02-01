import { ActionButton, Divider, Icon } from '@knockdog/ui';
import { useRef } from 'react';
import { KindergartenTabs } from '@widgets/kindergarten-tabs';
import { KindergartenMainBox, MainBannerSwiper } from '@features/kindergarten-main';
import type { KindergartenMain } from '@entities/kindergarten';

interface KindergartenDetailProps extends KindergartenMain {
  onPhoneCall: () => void;
  onBookmarkClick: (id: string, bookmarked: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function KindergartenDetail({ onPhoneCall, onBookmarkClick, activeTab, setActiveTab, ...props }: KindergartenDetailProps) {
  const scrollableContentRef = useRef<HTMLDivElement>(null);

  const { banner: images, ...restKindergartenMainData } = props;

  const handleReviewClick = () => {
    setActiveTab('후기'); // 후기 탭 활성화
  };

  return (
    <div className='flex h-full flex-col bg-white'>
      <div ref={scrollableContentRef} className='flex-1 overflow-y-auto'>
        <div>
          {/* 업체 메인이미지 슬라이드형 */}
          <MainBannerSwiper images={images ?? []} />
        </div>

        {/* 컨텐츠 영역 */}
        <div className='relative'>
          <div className='absolute top-[-50px]' />
          {/* 대표 컨텐츠 영역 */}
          <KindergartenMainBox {...restKindergartenMainData} />
          {/* Divider */}
          <Divider size='thick' />
          {/* 세부 컨텐츠 영역 */}
          {/* 탭 */}
          <KindergartenTabs
            kindergartenId={props.id}
            scrollableDivRef={scrollableContentRef}
            value={activeTab}
            onValueChange={setActiveTab}
          />
        </div>
      </div>

      {/* 하단 고정 버튼 영역 */}
      <aside className='p-x4 gap-x2 flex shrink-0 items-center border-t border-t-gray-100 bg-white'>
        <ActionButton variant='primaryLine' size='medium' onClick={onPhoneCall}>
          전화하기
        </ActionButton>
        <ActionButton variant='primaryFill' size='medium' onClick={handleReviewClick}>
          후기보기
        </ActionButton>
        <button
          aria-label='보관하기'
          className='radius-r3 bg-fill-primary-50 flex size-[44px] shrink-0 items-center justify-center'
          onClick={() => onBookmarkClick(props.id, props.bookmarked ?? false)}
        >
          <Icon icon={props.bookmarked ? 'BookmarkFill' : 'BookmarkLine'} className='size-x6 text-fill-primary-500' />
        </button>
      </aside>
    </div>
  );
}
