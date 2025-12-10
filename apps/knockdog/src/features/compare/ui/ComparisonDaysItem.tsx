import {
  KindergartenComparison,
  DayOfWeekShort,
  CircleAvatar,
  s3ToUrl,
  Description,
  DAY_OF_WEEK_SHORT,
} from '@entities/compare';

export function ComparisonDaysItem({ kindergarten }: { kindergarten: KindergartenComparison }) {
  const closedDays = kindergarten?.operatingSchedule?.closedDays;

  let DaysContent: React.ReactNode;

  if (!closedDays || !Array.isArray(closedDays)) {
    DaysContent = (
      <div className='mt-4 w-full'>
        <div className='label-medium text-text-secondary flex h-10 items-center justify-center rounded-lg bg-gray-100 text-sm'>
          영업일 정보가 없어요
        </div>
      </div>
    );
  } else {
    const openDays = Object.keys(DAY_OF_WEEK_SHORT).filter(
      (day) => !closedDays.includes(day as DayOfWeekShort)
    ) as DayOfWeekShort[];

    DaysContent = (
      <div className='mt-4 flex gap-1.5'>
        {Object.entries(DAY_OF_WEEK_SHORT).map(([day, label]) => {
          const isOpen = openDays.includes(day as DayOfWeekShort);
          return <DayChip key={day} isOn={isOpen} label={label} />;
        })}
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center p-2'>
      <CircleAvatar src={s3ToUrl(kindergarten.thumbnailS3Key)} />
      <div className='mt-2 max-w-full'>
        <Description highlight={kindergarten.name} truncate>
          {kindergarten.name}
        </Description>
      </div>
      {DaysContent}
    </div>
  );
}

function DayChip({ isOn, label }: { isOn: boolean; label: string }) {
  return (
    <span
      className={`${isOn ? 'bg-fill-secondary-800 text-white' : 'text-text-primary bg-gray-100'} label-extrabold flex h-10 w-10 items-center justify-center rounded-lg text-sm`}
    >
      {label}
    </span>
  );
}
