import { type HTMLAttributes } from 'react';
import { cn } from '@knockdog/ui/lib';
import { BOTTOM_CTA_ATTRIBUTE } from '@shared/constants';

type BottomCtaProps = HTMLAttributes<HTMLElement> & {
  /** 감싸는 태그. 기본은 div */
  as?: 'div' | 'aside' | 'footer';
};

/**
 * 화면 하단 CTA 영역 표시용 래퍼.
 * CTA 아래 16px을 확보한다. Safe Area는 화면 레이아웃에서 처리한다.
 * 토스트 위치 측정에 쓰는 `data-bottom-cta` 표식을 붙인다.
 */
const BottomCta = ({ as: Tag = 'div', children, className, ...props }: BottomCtaProps) => {
  const markerProps = { [BOTTOM_CTA_ATTRIBUTE]: '' };

  return (
    <Tag {...props} {...markerProps} className={cn('pb-x4', className)}>
      {children}
    </Tag>
  );
};

export { BottomCta };
export type { BottomCtaProps };
