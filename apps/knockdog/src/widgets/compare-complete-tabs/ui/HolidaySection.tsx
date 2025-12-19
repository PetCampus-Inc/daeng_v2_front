import { ComparisonSimpleItem, getHolidayKindergartens } from '@features/compare';
import type { KindergartenComparison } from '@entities/compare';
import { CircleAvatar, Description, Label, mapToSimpleItem } from '@entities/compare';

function HolidaySection({ left, right }: { left: KindergartenComparison; right: KindergartenComparison }) {
  const allKindergartens = [left, right].map(mapToSimpleItem);
  const holidayKindergartens = getHolidayKindergartens(left, right);

  const hasInsufficientData = !left.operatingSchedule?.closedDays || !right.operatingSchedule?.closedDays;

  if (hasInsufficientData) {
    const noDataKg = !left.operatingSchedule?.closedDays ? mapToSimpleItem(left) : mapToSimpleItem(right);
    return (
      <div className='mt-7 flex flex-col gap-5'>
        <Label>공휴일</Label>
        <div className='flex flex-col items-center'>
          <CircleAvatar src={noDataKg?.avatar} alt={noDataKg?.name} />
          <div className='mt-2 max-w-full'>
            <Description highlight={noDataKg.name} truncate>{`${noDataKg.name}의`}</Description>
            <Description>공휴일 정보가 없어 비교가 어려워요</Description>
          </div>
        </div>
      </div>
    );
  }

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

export { HolidaySection };
