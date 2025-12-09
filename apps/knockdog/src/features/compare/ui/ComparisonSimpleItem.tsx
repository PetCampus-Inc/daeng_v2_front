import { CircleAvatar, SimpleComparisonItem, StackedCircleAvatars, Summary } from '@entities/compare';

export function ComparisonSimpleItem({
  allKindergartens = [],
  matchedKindergartens = [],
  trueStatusText,
  falseStatusText,
}: {
  allKindergartens: SimpleComparisonItem[];
  matchedKindergartens: SimpleComparisonItem[];
  trueStatusText: string;
  falseStatusText: string;
}) {
  let AvatarComponent: React.ReactNode;
  let SummaryContent: React.ReactNode;

  // 2개 모두 충족
  if (matchedKindergartens.length === 2) {
    AvatarComponent = (
      <StackedCircleAvatars
        avatars={matchedKindergartens.map((kg) => ({
          src: kg.avatar,
          alt: kg.name,
        }))}
      />
    );
    SummaryContent = (
      <>
        <Summary highlight='두 유치원 모두'>두 유치원 모두</Summary>
        <Summary>{trueStatusText}</Summary>
      </>
    );
    // 1개만 충족
  } else if (matchedKindergartens.length === 1) {
    const kg = matchedKindergartens?.[0];

    AvatarComponent = <CircleAvatar src={kg?.avatar} alt={kg?.name} />;
    SummaryContent = (
      <>
        <Summary highlight={kg?.name} truncate>{`${kg?.name}만`}</Summary>
        <Summary>{trueStatusText}</Summary>
      </>
    );
  } else {
    // 0개 충족: 전체 유치원의 썸네일 표시
    AvatarComponent = (
      <StackedCircleAvatars
        avatars={allKindergartens.map((kg) => ({
          src: kg.avatar,
          alt: kg.name,
        }))}
      />
    );
    SummaryContent = (
      <>
        <Summary highlight='두 유치원 모두'>두 유치원 모두</Summary>
        <Summary>{falseStatusText}</Summary>
      </>
    );
  }

  return (
    <div className='flex flex-col items-center'>
      {AvatarComponent}
      <div className='mt-2'>{SummaryContent}</div>
    </div>
  );
}
