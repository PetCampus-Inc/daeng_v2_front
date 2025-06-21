// Tabs.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './TabMenu';

const meta: Meta<typeof Tabs> = {
  title: 'Components/TabMenu',
  component: Tabs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue='tab1'>
      <TabsList>
        <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
        <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
        <TabsTrigger value='tab3'>Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value='tab1'>This is content for Tab 1.</TabsContent>
      <TabsContent value='tab2'>This is content for Tab 2.</TabsContent>
      <TabsContent value='tab3'>This is content for Tab 3.</TabsContent>
    </Tabs>
  ),
};

// scrollable
export const Scrollable: Story = {
  render: () => (
    <Tabs defaultValue='tab1' className='w-[500px]'>
      <TabsList scrollable className='scrollbar-hide'>
        <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
        <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
        <TabsTrigger value='tab3'>Tab 3</TabsTrigger>
        <TabsTrigger value='tab4'>Tab 4</TabsTrigger>
        <TabsTrigger value='tab5'>Tab 5</TabsTrigger>
        <TabsTrigger value='tab6'>Tab 6</TabsTrigger>
        <TabsTrigger value='tab7'>Tab 7</TabsTrigger>
        <TabsTrigger value='tab8'>Tab 8</TabsTrigger>
        <TabsTrigger value='tab9'>Tab 9</TabsTrigger>
      </TabsList>
    </Tabs>
  ),
};
