import type { Meta, StoryObj } from '@storybook/nextjs';
import { FormField } from './FormField';

const meta = {
  title: 'Components/FormField',
  component: FormField,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    state: {
      control: 'select',
      options: ['default', 'filled', 'error', 'locked'],
    },
    trailingSize: {
      control: 'select',
      options: ['caption', 'body'],
    },
  },
  decorators: [
    (Story) => (
      <div className='w-[358px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: '이용권 이름',
    placeholder: '이름을 입력하세요.',
    trailing: '3/50',
    state: 'default',
  },
};

export const All: Story = {
  render: () => (
    <div className='flex w-[358px] flex-col gap-8'>
      <FormField label='이용권 이름' placeholder='이름을 입력하세요.' trailing='3/50' state='default' />
      <FormField label='이용권 이름' defaultValue='정기 10회권' trailing='6/50' state='filled' />
      <FormField label='이용권 이름' defaultValue='이름을 입력하세요.' trailing='3/50' state='error' errorMessage='오류 메시지' />
      <FormField label='이용권 이름' defaultValue='이름을 입력하세요.' trailing='3/50' state='locked' />
      <FormField label='이용 횟수' placeholder='10' trailing='회' trailingSize='body' state='default' />
      <FormField label='이용 횟수' defaultValue='10' trailing='회' trailingSize='body' state='filled' />
      <FormField label='이용 횟수' defaultValue='10' trailing='회' trailingSize='body' state='error' errorMessage='오류 메시지' />
      <FormField label='이용 횟수' defaultValue='10' trailing='회' trailingSize='body' state='locked' />
    </div>
  ),
};
