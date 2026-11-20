import { type HTMLAttributes } from 'react';
import { BOTTOM_CTA_ATTRIBUTE } from '@shared/constants';

type BottomCtaProps = HTMLAttributes<HTMLElement> & {
  /** 감싸는 태그. 기본은 div */
  as?: 'div' | 'aside' | 'footer';
};

/**
 * 화면 하단 CTA 영역 표시용 래퍼.
 * 모양은 바꾸지 않고 `data-bottom-cta`만 붙인다. 토스트가 이 영역 위에 뜨도록 위치를 잰다.
 */
const BottomCta = ({ as: Tag = 'div', children, ...props }: BottomCtaProps) => {
  const markerProps = { [BOTTOM_CTA_ATTRIBUTE]: '' };

  return (
    <Tag {...props} {...markerProps}>
      {children}
    </Tag>
  );
};

export { BottomCta };
export type { BottomCtaProps };
