import type { Meta, StoryObj } from '@storybook/nextjs';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: '체크박스의 체크 상태',
    },
    disabled: {
      control: 'boolean',
      description: '체크박스 비활성화 여부',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '체크박스의 크기 (sm: 20px, md: 25px, lg: 32px)',
    },
    label: {
      control: 'text',
      description: '체크박스와 함께 표시될 라벨 텍스트',
    },
    onCheckedChange: {
      action: 'checked',
      description: '체크 상태 변경 시 호출되는 콜백',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true,
  },
};

export const WithLabel: Story = {
  args: {
    label: '이용약관에 동의합니다',
  },
};

export const WithCustomLabel: Story = {
  render: (args) => (
    <Checkbox {...args}>
      <div className='text-sm'>
        <strong>개인정보처리방침</strong>에 동의합니다
      </div>
    </Checkbox>
  ),
  args: {},
};

export const SizeVariants: Story = {
  render: () => (
    <div className='space-y-4'>
      <Checkbox size='sm' label='Small 체크박스 (20x20px)' />
      <Checkbox size='md' label='Medium 체크박스 (25x25px) - 기본값' />
      <Checkbox size='lg' label='Large 체크박스 (32x32px)' />
    </div>
  ),
};

export const SizeVariantsChecked: Story = {
  render: () => (
    <div className='space-y-4'>
      <Checkbox size='sm' label='Small 체크박스' checked />
      <Checkbox size='md' label='Medium 체크박스' checked />
      <Checkbox size='lg' label='Large 체크박스' checked />
    </div>
  ),
};

export const DisabledVariants: Story = {
  render: () => (
    <div className='space-y-4'>
      <Checkbox size='sm' label='Small 체크박스 (비활성화)' disabled />
      <Checkbox size='md' label='Medium 체크박스 (비활성화)' disabled />
      <Checkbox size='lg' label='Large 체크박스 (비활성화)' disabled />
    </div>
  ),
};

export const DisabledCheckedVariants: Story = {
  render: () => (
    <div className='space-y-4'>
      <Checkbox size='sm' label='Small 체크박스 (체크됨, 비활성화)' checked disabled />
      <Checkbox size='md' label='Medium 체크박스 (체크됨, 비활성화)' checked disabled />
      <Checkbox size='lg' label='Large 체크박스 (체크됨, 비활성화)' checked disabled />
    </div>
  ),
};

export const MultipleCheckboxes: Story = {
  render: () => (
    <div className='space-y-3'>
      <Checkbox label='옵션 1' />
      <Checkbox label='옵션 2' />
      <Checkbox label='옵션 3' />
    </div>
  ),
};

export const ComplexLabels: Story = {
  render: () => (
    <div className='space-y-3'>
      <Checkbox>
        <div className='text-sm'>
          <span className='font-medium text-red-600'>필수</span> 이용약관에 동의합니다
        </div>
      </Checkbox>
      <Checkbox>
        <div className='text-sm'>
          <span className='font-medium text-blue-600'>선택</span> 마케팅 정보 수신에 동의합니다
        </div>
      </Checkbox>
      <Checkbox>
        <div className='text-sm'>
          <span className='font-medium text-blue-600'>선택</span> 개인정보 제3자 제공에 동의합니다
        </div>
      </Checkbox>
    </div>
  ),
};

export const InteractiveExample: Story = {
  render: () => (
    <div className='space-y-4 rounded-lg border p-4'>
      <h3 className='mb-3 text-lg font-semibold'>체크박스 예시</h3>
      <Checkbox size='sm' label='작은 체크박스' />
      <Checkbox size='md' label='기본 체크박스' />
      <Checkbox size='lg' label='큰 체크박스' />
      <Checkbox disabled label='비활성화된 체크박스' />
      <Checkbox checked disabled label='체크된 비활성화 체크박스' />
    </div>
  ),
};
