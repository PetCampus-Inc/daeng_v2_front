import { type RefObject } from 'react';
import { motion, type MotionValue } from 'framer-motion';
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
  return (
    <motion.div
      ref={ref}
      className='absolute top-0 left-0 z-50 w-full bg-white pt-(--safe-area-inset-top,0px)'
      style={{ opacity }}
    >
      <Header className='block'>
        <Header.LeftSection>
          <Header.BackButton onClick={onBack} />
          <Header.HomeButton onClick={onHome} />
        </Header.LeftSection>

        <Header.Title>{title}</Header.Title>

        <Header.RightSection>
          <Header.ShareButton onClick={onShare} disabled={!canShare} />
        </Header.RightSection>
      </Header>
    </motion.div>
  );
}
