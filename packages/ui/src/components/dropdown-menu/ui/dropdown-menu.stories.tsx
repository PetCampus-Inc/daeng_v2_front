import type { Meta, StoryObj } from '@storybook/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './DropdownMenu';
import { Button } from '../../button';
import { Icon } from '../../icon';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    // @ts-expect-error
    side: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: '기준 위치',
      table: {
        defaultValue: { summary: 'bottom' },
        category: ['DropdownMenu Content'],
      },
    },
    sideOffset: {
      control: 'number',
      description: '기준 위치로부터 오프셋값',
      table: {
        defaultValue: { summary: 6 },
        type: 'number',
        category: ['DropdownMenu Content'],
      },
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: '트리거 기준 정렬 방식',
      table: {
        defaultValue: { summary: 'center' },
        type: 'union',
        category: ['DropdownMenu Content'],
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  render: (arg) => (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant='fill' colorScheme='primary' size='lg'>
          Open Menu
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        sideOffset={
          // @ts-expect-error
          arg.sideOffset
        }
        align={
          // @ts-expect-error
          arg.align
        }
      >
        <DropdownMenuItem>
          <span className='bg-yellow3 rounded-md'>
            <Icon icon='CallDogOwner' className='size-5' />
          </span>
          전화 걸기
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span className='bg-yellow3 rounded-md'>
            <Icon icon='SendNotification' className='size-5' />
          </span>
          알림 전송하기
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span className='bg-yellow3 rounded-md'>
            <Icon icon='CircleClose' className='size-5' />
          </span>
          강아지 삭제
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
