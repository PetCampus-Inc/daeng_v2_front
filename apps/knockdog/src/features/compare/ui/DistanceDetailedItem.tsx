import { CircleAvatar, Description, Detail, StackedCircleAvatars } from '@entities/compare';
import { parseMinutesToTimeStr, s3ToUrl } from '@entities/compare/lib/utils';
import { DistanceDetailComparison } from '@entities/compare/model/types';

export function DistanceDetailedItem({
  comparison,
  badge,
}: {
  comparison: DistanceDetailComparison;
  badge: React.ReactNode;
}) {
  if (comparison.variant === 'insufficient-data') {
    const { leftKg } = comparison; // 왼쪽: 데이터가 없는 유치원

    return (
      <div className='flex flex-col items-center p-2'>
        {badge}
        <div className='mt-4 flex max-w-full flex-col items-center'>
          <CircleAvatar src={s3ToUrl(leftKg.avatar)} alt={leftKg.name} />
          <div className='mt-2 max-w-full'>
            <Description highlight={leftKg.name} truncate>{`${leftKg.name}의`}</Description>
            <Description>거리 정보가 없어 비교가 어려워요</Description>
          </div>
        </div>
      </div>
    );
  }

  if (comparison.variant === 'closer') {
    const { leftKg, rightKg } = comparison; // 왼쪽: 가까운 유치원
    const timeDiff = Math.abs(leftKg.value - rightKg.value);
    const timeDiffStr = parseMinutesToTimeStr(timeDiff);
    const leftTimeStr = parseMinutesToTimeStr(leftKg.value);
    const rightTimeStr = parseMinutesToTimeStr(rightKg.value);

    return (
      <div className='flex flex-col items-center p-2'>
        {badge}
        <div className='mt-4 flex max-w-full flex-col items-center'>
          <CircleAvatar src={s3ToUrl(leftKg.avatar)} />

          <div className='mt-2 max-w-full'>
            <Description highlight={leftKg.name} truncate>{`${leftKg.name}이(가)`}</Description>
            <Description highlight={`${timeDiffStr}`}>{`${timeDiffStr} 더 가까워요`}</Description>
            <Detail className='mt-1'>{`(${leftTimeStr} < ${rightTimeStr})`}</Detail>
          </div>
        </div>
      </div>
    );
  }

  if (comparison.variant === 'equal') {
    const { leftKg, rightKg } = comparison;
    const sameTime = leftKg.value;
    const sameTimeStr = parseMinutesToTimeStr(sameTime);

    return (
      <div className='flex flex-col items-center p-2'>
        {badge}
        <div className='mt-4 flex max-w-full flex-col items-center'>
          <StackedCircleAvatars
            avatars={[
              { src: s3ToUrl(leftKg.avatar), alt: leftKg.name },
              { src: s3ToUrl(rightKg.avatar), alt: rightKg.name },
            ]}
          />
          <div className='mt-2 max-w-full'>
            <Description highlight='두 유치원'>두 유치원까지 거리가 같아요</Description>
            <Detail className='mt-1'>{`(모두 ${sameTimeStr})`}</Detail>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
