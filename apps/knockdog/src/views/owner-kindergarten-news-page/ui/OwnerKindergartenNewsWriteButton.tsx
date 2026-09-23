'use client';

import { FloatingActionButton } from '@knockdog/ui';

import { ownerKindergartenNewsContent } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsContent';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

interface OwnerKindergartenNewsWriteButtonProps {
  onClick?: () => void;
  /** 소식 0건(또는 empty=1) 상태에서 등록으로 진입할 때 배너 노출용 */
  openAsEmpty?: boolean;
}

/** 앨범 업로드 FAB와 동일 스펙 (Plus / extended=false / primarySolid) */
function OwnerKindergartenNewsWriteButton({
  onClick,
  openAsEmpty = false,
}: OwnerKindergartenNewsWriteButtonProps) {
  const { push } = useStackNavigation();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    void push({
      pathname: route.owner.news.write.root,
      ...(openAsEmpty ? { query: { empty: '1' } } : {}),
    });
  };

  return (
    <FloatingActionButton
      type='button'
      icon='Plus'
      label={ownerKindergartenNewsContent.writeButtonLabel}
      extended={false}
      aria-label={ownerKindergartenNewsContent.writeButtonLabel}
      className='absolute right-4 bottom-5 z-10'
      onClick={handleClick}
    />
  );
}

export { OwnerKindergartenNewsWriteButton };
