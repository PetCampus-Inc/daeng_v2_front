import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
import { Icon, iconTypes } from '../../icon';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  subcomponents: { TabsList, TabsTrigger, TabsContent },
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'Dark',
    },
  },
  args: {
    defaultValue: 'tab1',
    variant: 'underline',
  },
  argTypes: {
    value: {
      description: '제어 컴포넌트로 사용 시 선택된 탭입니다.',
      table: { category: 'Tabs Trigger' },
    },
    defaultValue: {
      control: 'select',
      options: ['tab1', 'tab2', 'tab3'],
      description: '비제어 컴포넌트로 사용 시 기본적으로 선택된 탭입니다.',
      table: { category: 'Tabs' },
    },
    variant: {
      control: 'select',
      options: ['underline', 'divider'],
      description: '탭의 스타일 변형입니다.',
      table: { category: 'Tabs' },
    },
    onValueChange: {
      action: 'changed',
      description: '새로운 탭이 선택될 때 호출되는 함수입니다.',
      table: { category: 'Tabs' },
    },
    // @ts-expect-error
    margin: {
      control: 'select',
      options: [0, 2, 4],
      description: '탭의 (측면)여백을 설정합니다.',
      table: { defaultValue: { summary: 0 }, category: ['Tabs List'] },
    },
    padding: {
      control: 'select',
      options: [0, 2, 4, 8],
      description: '탭 아이템들의 여백을 설정합니다.',
      table: { defaultValue: { summary: 0 }, category: ['Tabs Trigger'] },
    },
    gap: {
      control: 'select',
      options: [0, 2, 4],
      description: '탭 아이템들의 간격을 설정합니다.',
      table: { defaultValue: { summary: 4 }, category: ['Tabs List'] },
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'between'],
      description: '탭 정렬을 설정합니다.',
      table: { defaultValue: { summary: 'center' }, category: ['Tabs List'] },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: 'tab2',
  },

  parameters: {
    docs: {
      description: {
        story: '(default) underline 스타일의 탭',
      },
    },
  },

  render: (args) => (
    <Tabs
      value={args.value}
      defaultValue={args.defaultValue}
      onValueChange={args.onValueChange}
      variant={args.variant}
    >
      <TabsList margin={args.margin} align={args.align} gap={args.gap}>
        <TabsTrigger padding={args.padding} value='tab1'>
          탭1
        </TabsTrigger>
        <TabsTrigger padding={args.padding} value='tab2'>
          탭2
        </TabsTrigger>
        <TabsTrigger padding={args.padding} value='tab3'>
          탭3
        </TabsTrigger>
      </TabsList>
      <TabsContent value='tab1'>탭 1의 내용입니다.</TabsContent>
      <TabsContent value='tab2'>탭 2의 내용입니다.</TabsContent>
      <TabsContent value='tab3'>탭 3의 내용입니다.</TabsContent>
    </Tabs>
  ),
};

export const TabWithDivider: Story = {
  args: {
    variant: 'divider',
    padding: 8,
    gap: 0,
    align: 'between',
  },
  parameters: {
    docs: {
      description: {
        story: 'divider 스타일의 탭',
      },
    },
  },
  render: (args) => (
    <Tabs
      value={args.value}
      defaultValue={args.defaultValue}
      onValueChange={args.onValueChange}
      variant={args.variant}
    >
      <TabsList margin={args.margin} align={args.align} gap={args.gap}>
        <TabsTrigger padding={args.padding} value='tab1'>
          탭1
        </TabsTrigger>
        <TabsTrigger padding={args.padding} value='tab2'>
          탭2
        </TabsTrigger>
        <TabsTrigger padding={args.padding} value='tab3'>
          탭3
        </TabsTrigger>
      </TabsList>
    </Tabs>
  ),
};

export const TabWithIcon: Story = {
  args: {
    variant: 'divider',
    icon: 'Gallery',
  },
  argTypes: {
    icon: {
      control: 'select',
      options: iconTypes,
      description: '아이콘을 설정합니다.',
      table: { type: { summary: 'IconType' } },
    },
  },
  render: (args) => (
    <Tabs
      value={args.value}
      defaultValue={args.defaultValue}
      onValueChange={args.onValueChange}
      variant={args.variant}
    >
      <TabsList>
        <TabsTrigger icon={<Icon icon={args.icon} />} padding={8} value='tab1'>
          탭1
        </TabsTrigger>
        <TabsTrigger icon={<Icon icon={args.icon} />} padding={8} value='tab2'>
          탭2
        </TabsTrigger>
        <TabsTrigger icon={<Icon icon={args.icon} />} padding={8} value='tab3'>
          탭3
        </TabsTrigger>
      </TabsList>
    </Tabs>
  ),
};

export const FixedTabItem: Story = {
  args: {
    padding: 8,
    gap: 0,
    align: 'between',
  },
  render: (args) => (
    <Tabs
      value={args.value}
      defaultValue={args.defaultValue}
      onValueChange={args.onValueChange}
      variant={args.variant}
    >
      <TabsList gap={args.gap} align={args.align}>
        <TabsTrigger padding={args.padding} value='tab1'>
          탭1
        </TabsTrigger>
        <TabsTrigger padding={args.padding} value='tab2'>
          탭2
        </TabsTrigger>
        <TabsTrigger padding={args.padding} value='tab3'>
          탭3
        </TabsTrigger>
      </TabsList>
    </Tabs>
  ),
};
