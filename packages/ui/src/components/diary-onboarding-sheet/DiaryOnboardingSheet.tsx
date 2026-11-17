'use client';

import { useRef, useState } from 'react';

import { cn } from '@knockdog/ui/lib';

import { DiarySampleCard, type DiarySampleCardProps } from '../diary-sample-card';

interface DiaryOnboardingCard extends Pick<DiarySampleCardProps, 'date' | 'body' | 'image'> {
  id: string;
  imageSrc?: string;
}

interface DiaryOnboardingSheetProps {
  dogName?: string;
  description?: string;
  cards?: DiaryOnboardingCard[];
  className?: string;
  onStart?: () => void;
  onSkip?: () => void;
}

const DIARY_ONBOARDING_SAMPLE_CARDS: DiaryOnboardingCard[] = [
  {
    id: 'leaf',
    date: '6월 15일 월요일',
    body: '오늘은 공원에서 낙엽을 잔뜩 밟았어!\n바스락 소리가 너무 좋아서 계속 뛰어다녔지.\n집에 오는 길에 다리가 조금 아팠지만 엄마가 안아줘서 괜찮았어. 내일도 또 가고 싶어!',
  },
  {
    id: 'flower',
    date: '6월 2일 화요일',
    body: '산책하다가 꽃집 앞에서 발이 멈췄어.\n처음 맡아보는 달콤한 냄새가 가득했거든.\n한참을 킁킁거렸는데 가족이 재촉하지 않고 기다려줬어. 오늘 산책은 평소보다 길어서 더 좋았어.',
  },
  {
    id: 'sister',
    date: '6월 5일 금요일',
    body: '오늘 누나가 처음 보는 이상한 꽃을 가져왔어.\n처음엔 뭔가 싶어서 멀찍이 쳐다만 봤는데, 코를 대보니 향기가 정말 좋았어. 날씨도 좋고, 누나도 좋고. 오늘은 다 좋은 날이야!',
  },
];

const CARD_STEP = 314;

function formatDiaryOnboardingDescription(dogName: string) {
  return `사진 한 장과 한 줄만 남기면\nAI와 함께 ${dogName} 시절의 일기를 만들 수 있어요.`;
}

function renderSampleImage(card: DiaryOnboardingCard) {
  if (card.image) return card.image;
  if (!card.imageSrc) return undefined;
  return <img src={card.imageSrc} alt='' className='block size-full object-cover' />;
}

/** V4 / Dog Diary / Bottom Sheet Diary Onboarding */
function DiaryOnboardingSheet({
  dogName = '강아지',
  description,
  cards = DIARY_ONBOARDING_SAMPLE_CARDS,
  className,
  onStart,
  onSkip,
}: DiaryOnboardingSheetProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function handleScroll() {
    const scrollLeft = scrollerRef.current?.scrollLeft ?? 0;
    const nextIndex = Math.min(cards.length - 1, Math.max(0, Math.round(scrollLeft / CARD_STEP)));
    setActiveIndex(nextIndex);
  }

  return (
    <section className={cn('bg-bg-0 flex w-full flex-col overflow-hidden rounded-t-[24px] shadow-[0_-16px_10px_rgba(0,0,0,0.05)]', className)}>
      <div className='flex h-x8 w-full justify-center pt-x3'>
        <span className='bg-fill-secondary-400 h-x1 w-x9 rounded-full' />
      </div>
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className='gap-x3 px-x5 pt-x8 pb-x5 flex w-full snap-x snap-mandatory overflow-x-auto scroll-pl-[20px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
      >
        {cards.map((card) => (
          <DiarySampleCard key={card.id} date={card.date} body={card.body} image={renderSampleImage(card)} className='shrink-0 snap-start' />
        ))}
      </div>
      <div className='gap-x1_5 py-x1 flex w-full items-center justify-center'>
        {cards.map((card, index) => (
          <span
            key={card.id}
            className={cn('rounded-full', index === activeIndex ? 'bg-text-primary h-[6px] w-[18px]' : 'bg-primitive-neutral-300 size-[6px]')}
          />
        ))}
      </div>
      <div className='gap-x1 px-x4 pt-x6 pb-x2 flex flex-col items-center text-center'>
        <h2 className='h2-extrabold text-text-primary'>{dogName}의 목소리로 일기를 남겨보세요</h2>
        <p className='body2-regular text-text-secondary whitespace-pre-line'>
          {description ?? formatDiaryOnboardingDescription(dogName)}
        </p>
      </div>
      <div className='gap-x1 px-x4 pt-x4 flex flex-col'>
        <button type='button' onClick={onStart} className='body1-bold bg-fill-primary-500 text-text-primary-inverse radius-r3 flex h-x14 w-full items-center justify-center'>
          첫 일기 남기기
        </button>
        <button type='button' onClick={onSkip} className='body2-regular text-fill-secondary-500 flex h-x12 w-full items-center justify-center'>
          다음에 할게요
        </button>
      </div>
    </section>
  );
}

export { DiaryOnboardingSheet, DIARY_ONBOARDING_SAMPLE_CARDS, formatDiaryOnboardingDescription };
export type { DiaryOnboardingCard, DiaryOnboardingSheetProps };
