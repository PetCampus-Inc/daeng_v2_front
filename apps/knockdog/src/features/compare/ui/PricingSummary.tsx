import type { PriceDetailComparison } from '@entities/compare';
import { Summary } from '@entities/compare';
import { getSubjectParticle } from '@shared/utils';

export function PricingSummary({ comparison }: { comparison: PriceDetailComparison }) {
  const { variant, leftKg, rightKg } = comparison;

  if (variant === 'cheaper') {
    const cheaperKg = leftKg; // 왼쪽: 저렴한 유치원
    const priceDiffStr = Math.abs(leftKg.value - rightKg.value).toLocaleString();
    const subjectParticle = getSubjectParticle(cheaperKg.name);
    return (
      <>
        <Summary highlight={cheaperKg.name} truncate>{`${cheaperKg.name}${subjectParticle}`}</Summary>
        <Summary highlight={`약 ${priceDiffStr}원`}>{`1시간당 약 ${priceDiffStr}원 더 저렴해요`}</Summary>
      </>
    );
  }

  if (variant === 'equal') {
    const samePriceStr = leftKg.value.toLocaleString();
    return (
      <>
        <Summary>두 유치원이 똑같이</Summary>
        <Summary highlight={`약 ${samePriceStr}원`}>{`1시간당 약 ${samePriceStr}원이 들어요`}</Summary>
      </>
    );
  }

  if (variant === 'insufficient-data') {
    return null;
  }

  return null;
}
