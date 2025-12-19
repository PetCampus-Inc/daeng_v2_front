import { ComparisonDaysItem } from '@features/compare';
import type { KindergartenComparison } from '@entities/compare';
import { Label } from '@entities/compare';

function OperatingDaysSection({ left, right }: { left: KindergartenComparison; right: KindergartenComparison }) {
  return (
    <div>
      <Label>영업일</Label>
      <div className='flex flex-col gap-5 pt-5 pb-7'>
        <ComparisonDaysItem kindergarten={left} />
        <ComparisonDaysItem kindergarten={right} />
      </div>
    </div>
  );
}

export { OperatingDaysSection };
