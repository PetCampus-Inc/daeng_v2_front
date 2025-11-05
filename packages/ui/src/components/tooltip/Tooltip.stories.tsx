import type { Meta, StoryObj } from '@storybook/nextjs';
import { Tooltip, TooltipTrigger, TooltipContent } from './Tooltip';
import { ActionButton } from '../action-button';
import { IconButton } from '../icon-button';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    placement: {
      control: { type: 'select' },
      options: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      table: {
        type: { summary: '"top-left" | "top-right" | "bottom-left" | "bottom-right"' },
        defaultValue: { summary: '"top-right"' },
      },
    },
    offset: {
      control: { type: 'number' },
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '8' },
      },
    },
    autoCloseMs: {
      control: { type: 'number' },
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: 'undefined' },
      },
    },
    closeOnOutsideClick: {
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    closeOnEsc: {
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    defaultOpen: {
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    open: {
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
      },
    },
    onOpenChange: {
      action: 'onOpenChange',
      table: {
        type: { summary: '(open: boolean) => void' },
      },
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger />
      <TooltipContent>기본 툴팁입니다</TooltipContent>
    </Tooltip>
  ),
};

export const WithButton: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <ActionButton>버튼에 마우스를 올려보세요</ActionButton>
      </TooltipTrigger>
      <TooltipContent>버튼 위에 표시되는 툴팁입니다</TooltipContent>
    </Tooltip>
  ),
};

export const WithCustomText: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger>커스텀 트리거</TooltipTrigger>
      <TooltipContent>커스텀 트리거 텍스트가 있는 툴팁입니다</TooltipContent>
    </Tooltip>
  ),
};

export const PlacementTopLeft: Story = {
  render: () => (
    <Tooltip placement='top-left'>
      <TooltipTrigger />
      <TooltipContent>top-left 위치의 툴팁입니다</TooltipContent>
    </Tooltip>
  ),
};

export const PlacementTopRight: Story = {
  render: () => (
    <Tooltip placement='top-right'>
      <TooltipTrigger />
      <TooltipContent>top-right 위치의 툴팁입니다</TooltipContent>
    </Tooltip>
  ),
};

export const PlacementBottomLeft: Story = {
  render: () => (
    <Tooltip placement='bottom-left'>
      <TooltipTrigger />
      <TooltipContent>bottom-left 위치의 툴팁입니다</TooltipContent>
    </Tooltip>
  ),
};

export const PlacementBottomRight: Story = {
  render: () => (
    <Tooltip placement='bottom-right'>
      <TooltipTrigger />
      <TooltipContent>bottom-right 위치의 툴팁입니다</TooltipContent>
    </Tooltip>
  ),
};

export const AutoClose: Story = {
  render: () => (
    <Tooltip autoCloseMs={2000}>
      <TooltipTrigger />
      <TooltipContent>2초 후 자동으로 닫힙니다</TooltipContent>
    </Tooltip>
  ),
};

export const CloseOnOutsideClick: Story = {
  render: () => (
    <Tooltip closeOnOutsideClick>
      <TooltipTrigger />
      <TooltipContent>바깥 영역을 클릭하면 닫힙니다</TooltipContent>
    </Tooltip>
  ),
};

export const CloseOnEsc: Story = {
  render: () => (
    <Tooltip closeOnEsc>
      <TooltipTrigger />
      <TooltipContent>ESC 키를 누르면 닫힙니다</TooltipContent>
    </Tooltip>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger />
      <TooltipContent>
        이것은 매우 긴 텍스트를 포함하는 툴팁입니다. 여러 줄에 걸쳐 표시될 수 있으며, 사용자에게 상세한 정보를
        제공합니다.
      </TooltipContent>
    </Tooltip>
  ),
};

export const ScrollableContainer: Story = {
  render: () => (
    <div className='h-[400px] w-[300px] overflow-y-auto border border-gray-300 p-4'>
      <div className='mb-[800px]'>
        <p className='mb-4'>스크롤 가능한 컨테이너입니다. 아래로 스크롤해보세요.</p>
        <Tooltip placement='bottom-right'>
          <TooltipTrigger />
          <TooltipContent>툴팁을 클릭한 후 스크롤하면 자동으로 닫힙니다</TooltipContent>
        </Tooltip>
      </div>
      <div className='mt-4'>
        <Tooltip placement='bottom-right'>
          <TooltipTrigger />
          <TooltipContent>스크롤하면 자동으로 닫힙니다</TooltipContent>
        </Tooltip>
      </div>
    </div>
  ),
};
