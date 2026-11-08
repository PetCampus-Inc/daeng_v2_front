import type { Meta, StoryObj } from '@storybook/nextjs';
import { DiaryOnboardingSheet } from './DiaryOnboardingSheet';

const meta = {
  title: 'Components/DiaryOnboardingSheet',
  component: DiaryOnboardingSheet,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className='w-[390px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DiaryOnboardingSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

const photoColors = ['bg-primitive-orange-200', 'bg-primitive-orange-300', 'bg-primitive-orange-400'] as const;

export const Default: Story = {
  args: {
    cards: [
      {
        id: 'leaf',
        date: '6월 15일 월요일',
        body: '오늘은 공원에서 낙엽을 잔뜩 밟았어!\n바스락 소리가 너무 좋아서 계속 뛰어다녔지.\n집에 오는 길에 다리가 조금 아팠지만 엄마가 안아줘서 괜찮았어. 내일도 또 가고 싶어!',
        image: <span className={`${photoColors[0]} block size-full`} />,
      },
      {
        id: 'flower',
        date: '6월 2일 화요일',
        body: '산책하다가 꽃집 앞에서 발이 멈췄어.\n처음 맡아보는 달콤한 냄새가 가득했거든.\n한참을 킁킁거렸는데 가족이 재촉하지 않고 기다려줬어. 오늘 산책은 평소보다 길어서 더 좋았어.',
        image: <span className={`${photoColors[1]} block size-full`} />,
      },
      {
        id: 'sister',
        date: '6월 5일 금요일',
        body: '오늘 누나가 처음 보는 이상한 꽃을 가져왔어.\n처음엔 뭔가 싶어서 멀찍이 쳐다만 봤는데, 코를 대보니 향기가 정말 좋았어. 날씨도 좋고, 누나도 좋고. 오늘은 다 좋은 날이야!',
        image: <span className={`${photoColors[2]} block size-full`} />,
      },
    ],
  },
};
