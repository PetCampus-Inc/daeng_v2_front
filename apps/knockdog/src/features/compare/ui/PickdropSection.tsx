import { getValetKindergartens } from '../lib/getValetKindergartens';
import { ComparisonSimpleItem } from './ComparisonSimpleItem';
import type { KindergartenComparison } from '@entities/compare';
import { Label, mapToSimpleItem } from '@entities/compare';

export function PickdropSection({ left, right }: { left: KindergartenComparison; right: KindergartenComparison }) {
  const allKindergartens = [left, right].map(mapToSimpleItem);
  const valetKindergartens = getValetKindergartens(left, right);

  return (
    <div className='mt-7 flex flex-col gap-5'>
      <Label>픽드랍</Label>
      <ComparisonSimpleItem
        allKindergartens={allKindergartens}
        matchedKindergartens={valetKindergartens}
        trueStatusText='픽드랍 서비스를 제공해요'
        falseStatusText='픽드랍 서비스가 없어요'
      />
    </div>
  );
}
