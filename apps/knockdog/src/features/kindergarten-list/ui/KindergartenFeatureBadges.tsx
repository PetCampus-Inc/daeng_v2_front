import { Verified } from '@knockdog/icons';

interface KindergartenFeatureBadgesProps {
  verified?: boolean;
  resident?: boolean;
  residentLabel?: string;
  secondaryLabel?: string;
}

/** 업체 상세 시트의 운영·서비스 강조 배지 */
export function KindergartenFeatureBadges({
  verified = false,
  resident = false,
  residentLabel = '똑독 인증',
  secondaryLabel = '유치원을 다니는 중이에요',
}: KindergartenFeatureBadgesProps) {
  if (!verified && !resident) return null;

  return (
    <div className='flex h-[26px] items-center gap-x1'>
      {verified && (
        <div className='bg-fill-primary-500 radius-full flex h-[26px] items-center justify-center gap-x0_5 px-x2 py-x1'>
          <Verified inverted className='size-x4 shrink-0' />
          <span className='caption1-semibold text-text-primary-inverse whitespace-nowrap'>{residentLabel}</span>
        </div>
      )}
      {resident && (
        <div className='bg-fill-secondary-0 border-fill-primary-500 radius-full flex h-[26px] items-center justify-center border px-x2 py-x1'>
          <span className='caption1-semibold text-text-accent whitespace-nowrap'>{secondaryLabel}</span>
        </div>
      )}
    </div>
  );
}
