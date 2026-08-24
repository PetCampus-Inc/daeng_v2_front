import { type RefObject } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { Header } from '@widgets/Header';

interface KindergartenItemSheetHeaderProps {
  ref: RefObject<HTMLDivElement | null>;
  title?: string;
  onBack: () => void;
  onHome: () => void;
  onShare: () => void;
  canShare: boolean;
  opacity: MotionValue<number>;
}

export function KindergartenItemSheetHeader({
  ref,
  title,
  onBack,
  onHome,
  onShare,
  canShare,
  opacity,
}: KindergartenItemSheetHeaderProps) {
  // opacity 0이어도 클릭을 먹어 검색바 Close가 공유로 오인되는 것 방지
  const pointerEvents = useTransform(opacity, (value) => (value > 0.05 ? 'auto' : 'none'));

  return (
    <motion.div
      ref={ref}
      className='absolute top-0 left-0 z-50 w-full bg-white pt-(--safe-area-inset-top,0px)'
      style={{ opacity, pointerEvents }}
    >
      <Header className='block'>
        <Header.LeftSection>
          <Header.BackButton onClick={onBack} />
          <Header.HomeButton onClick={onHome} />
        </Header.LeftSection>

        <Header.Title className='max-w-[calc(100%-7.5rem)] truncate'>{title}</Header.Title>

        <Header.RightSection>
          <Header.ShareButton onClick={onShare} disabled={!canShare} />
        </Header.RightSection>
      </Header>
    </motion.div>
  );
}
