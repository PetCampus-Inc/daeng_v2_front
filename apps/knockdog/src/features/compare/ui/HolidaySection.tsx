import { getHolidayKindergartens } from '../lib/getHolidayKindergartens';
import { ComparisonSimpleItem } from './ComparisonSimpleItem';
import { KindergartenComparison, Label, mapToSimpleItem } from '@entities/compare';

export function HolidaySection({ left, right }: { left: KindergartenComparison; right: KindergartenComparison }) {
  const allKindergartens = [left, right].map(mapToSimpleItem);
  const holidayKindergartens = getHolidayKindergartens(left, right);

  return (
    <div className='mt-7 flex flex-col gap-5'>
      <Label>공휴일</Label>
      <ComparisonSimpleItem
        allKindergartens={allKindergartens}
        matchedKindergartens={holidayKindergartens}
        trueStatusText='공휴일에도 영업해요'
        falseStatusText='공휴일에 쉬어요'
      />
    </div>
  );
}
