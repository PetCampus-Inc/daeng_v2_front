import { PriceDetailedItem } from './PriceDetailedItem';
import { CircleAvatar, Description, PricingSummary } from '@entities/compare';
import { s3ToUrl } from '@entities/compare/lib/utils';
import { PriceDetailComparison } from '@entities/compare/model/types';
import { Label } from '@entities/compare/ui/Label';
import { Badge } from '@entities/compare/ui/Badge';

function PricingLabel({ className = '' }: { className?: string }) {
  const tooltipText =
    '여기서 보여드리는 금액은 두 곳의 이용료를 ‘1시간 기준’으로 맞춰 비교한 값이에요. 요금제가 달라도 시간을 기준으로 동일하게 환산해 얼마나 차이가 나는지 쉽게 볼 수 있게 정리했어요. 실제 비용은 요일이나 이용 방식에 따라 조금 달라질 수 있으므로, 정확한 비용은 업체로 문의해주세요.';
  return (
    <Label tooltip={tooltipText} className={className}>
      이용 요금
    </Label>
  );
}
export function PricingSection({
  monthlyPricingComparison,
  countPricingComparison,
}: {
  monthlyPricingComparison?: PriceDetailComparison | null;
  countPricingComparison?: PriceDetailComparison | null;
}) {
  if (!monthlyPricingComparison || !countPricingComparison) {
    return null;
  }

  const hasInsufficientData =
    monthlyPricingComparison.variant === 'insufficient-data' || countPricingComparison.variant === 'insufficient-data';

  if (hasInsufficientData) {
    const insufficientComparison =
      monthlyPricingComparison.variant === 'insufficient-data' ? monthlyPricingComparison : countPricingComparison;

    const missingKg = insufficientComparison.leftKg; // 왼쪽: 데이터가 없는 유치원

    return (
      <div className='mb-7 flex flex-col gap-5'>
        <PricingLabel />

        <div className='flex max-w-full flex-col items-center'>
          <CircleAvatar src={s3ToUrl(missingKg.avatar)} alt={missingKg.name} />
          <div className='mt-2 max-w-full'>
            <Description highlight={missingKg.name} truncate>{`${missingKg.name}의`}</Description>
            <Description>가격 정보가 없어 비교가 어려워요</Description>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PricingLabel className='mb-2' />
      <PricingSummary comparison={monthlyPricingComparison} />
      <div className='my-7 flex flex-col gap-5'>
        <PriceDetailedItem comparison={monthlyPricingComparison} badge={<Badge caption='1시간 평균'>정기권</Badge>} />
        <PriceDetailedItem comparison={countPricingComparison} badge={<Badge caption='1회 평균'>횟수권</Badge>} />
      </div>
    </>
  );
}
