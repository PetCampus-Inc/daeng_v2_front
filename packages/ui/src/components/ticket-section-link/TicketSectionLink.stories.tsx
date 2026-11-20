import type { Meta, StoryObj } from '@storybook/nextjs';
import { TicketSectionLink } from './TicketSectionLink';

const meta = {
  title: 'Components/TicketSectionLink',
  component: TicketSectionLink,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof TicketSectionLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
