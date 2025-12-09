import { CircleAvatar, Description, Detail } from '@entities/compare';
import { s3ToUrl } from '@entities/compare/lib/utils';
import { PriceDetailComparison } from '@entities/compare/model/types';

export function PriceDetailedItem({
  comparison,
  badge,
}: {
  comparison: PriceDetailComparison;
  badge: React.ReactNode;
}) {
  if (comparison.variant === 'cheaper') {
    const { leftKg, rightKg } = comparison; // 왼쪽: 저렴한 유치원

    const priceDiffStr = Math.abs(leftKg.value - rightKg.value).toLocaleString();
    const leftPriceStr = leftKg.value.toLocaleString();
    const rightPriceStr = rightKg.value.toLocaleString();

    console.log(leftPriceStr, rightPriceStr);

    return (
      <div className='flex flex-col items-center p-2'>
        {badge}
        <div className='mt-4 flex max-w-full flex-col items-center'>
          <CircleAvatar src={s3ToUrl(leftKg.avatar)} />

          <div className='mt-2 max-w-full'>
            <Description highlight={leftKg.name} truncate>{`${leftKg.name}이(가)`}</Description>
            <Description highlight={`약 ${priceDiffStr}원`}>{`약 ${priceDiffStr}원 더 저렴해요`}</Description>
            <Detail
              className='mt-1'
              highlight={`${leftPriceStr}원`}
            >{`(${leftPriceStr}원 < ${rightPriceStr}원)`}</Detail>
          </div>
        </div>
      </div>
    );
  }
}
