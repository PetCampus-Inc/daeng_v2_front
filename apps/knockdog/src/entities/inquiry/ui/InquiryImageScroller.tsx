'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

const SLIDER_THUMB_WIDTH = 50;

interface InquiryImageScrollerProps {
  children: ReactNode;
}

/** 문의 사진을 가로로 나열한다. 화면을 넘을 때만 아래에 슬라이더(스크롤 위치 표시)를 보여준다 */
function InquiryImageScroller({ children }: InquiryImageScrollerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [slider, setSlider] = useState({ visible: false, left: 0 });

  const updateSlider = useCallback(() => {
    const root = rootRef.current;
    const element = scrollRef.current;
    if (!root || !element) return;

    const maxScroll = element.scrollWidth - element.clientWidth;
    const visible = maxScroll > 1;
    // 슬라이더 트랙은 스크롤 영역보다 16px 좁으므로 바깥 폭 기준으로 계산한다
    const maxLeft = Math.max(root.clientWidth - SLIDER_THUMB_WIDTH, 0);
    setSlider({ visible, left: visible ? (element.scrollLeft / maxScroll) * maxLeft : 0 });
  }, []);

  // 화면 폭이 바뀌거나 사진이 늘고 줄면 넘침 여부를 다시 계산한다
  useEffect(() => {
    const element = scrollRef.current;
    const content = contentRef.current;
    if (!element || !content) return;

    updateSlider();
    const observer = new ResizeObserver(updateSlider);
    observer.observe(element);
    observer.observe(content);
    return () => observer.disconnect();
  }, [updateSlider]);

  // Figma: 사진 줄은 오른쪽 여백(16px)을 넘어 화면 끝까지 보이고, 슬라이더는 여백 안쪽 폭을 쓴다.
  // 좌우 16px 여백(px-x4) 안에 두는 것을 전제로 스크롤 영역만 오른쪽으로 16px 넓힌다.
  // 토큰 간격 유틸리티(mr-x4)는 음수(-mr-x4)를 만들지 않아 토큰 변수로 직접 계산한다
  return (
    <div ref={rootRef} className='gap-x2 flex flex-col'>
      <div ref={scrollRef} className='scrollbar-hide mr-[calc(var(--dimension-x4)*-1)] overflow-x-auto' onScroll={updateSlider}>
        <div ref={contentRef} className='gap-x2 pr-x4 flex w-max'>
          {children}
        </div>
      </div>

      {slider.visible ? (
        <div className='py-x2'>
          <div className='bg-bg-50 radius-full relative h-1 w-full'>
            <div
              className='bg-fill-secondary-700 radius-full absolute top-0 h-1'
              style={{ width: SLIDER_THUMB_WIDTH, transform: `translateX(${slider.left}px)` }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { InquiryImageScroller };
