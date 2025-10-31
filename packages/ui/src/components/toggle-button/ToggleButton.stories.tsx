import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { ToggleButton } from './ToggleButton';

const meta: Meta<typeof ToggleButton> = {
  title: 'Components/ToggleButton',
  component: ToggleButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: { type: 'boolean' },
    },
    pressed: {
      control: { type: 'boolean' },
    },
    onPressedChange: {
      action: 'pressed changed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Toggle Button',
  },
};

export const Controlled: Story = {
  render: function Render() {
    const [pressed, setPressed] = useState(false);

    return (
      <div className='flex flex-col gap-4'>
        <ToggleButton pressed={pressed} onPressedChange={setPressed}>
          {pressed ? 'Pressed' : 'Unpressed'}
        </ToggleButton>
        <div className='text-sm text-gray-600'>State: {pressed ? 'Pressed' : 'Unpressed'}</div>
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
};

export const WithIcon: Story = {
  render: function Render() {
    const [pressed, setPressed] = useState(false);

    return (
      <div className='flex gap-2'>
        <ToggleButton pressed={pressed} onPressedChange={setPressed}>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path d='M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z' fill='currentColor' />
          </svg>
          Star {pressed ? '(Pressed)' : ''}
        </ToggleButton>
      </div>
    );
  },
};

export const States: Story = {
  render: function Render() {
    const [pressed1, setPressed1] = useState(false);
    const [pressed2, setPressed2] = useState(true);

    return (
      <div className='flex flex-col gap-4'>
        <div className='flex gap-2'>
          <ToggleButton pressed={pressed1} onPressedChange={setPressed1}>
            Unpressed
          </ToggleButton>
          <ToggleButton pressed={pressed2} onPressedChange={setPressed2}>
            Pressed
          </ToggleButton>
          <ToggleButton disabled>Disabled</ToggleButton>
        </div>
        <div className='text-sm text-gray-600'>
          <div>Button 1: {pressed1 ? 'Pressed' : 'Unpressed'}</div>
          <div>Button 2: {pressed2 ? 'Pressed' : 'Unpressed'}</div>
        </div>
      </div>
    );
  },
};

export const ToggleButtonGroup: Story = {
  render: () => {
    const ToggleButtonGroupComponent = () => {
      const [selectedOptions, setSelectedOptions] = useState<string[]>(['option1']);

      const handleOptionChange = (option: string) => {
        setSelectedOptions((prev) =>
          prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
        );
      };

      return (
        <div className='flex flex-col gap-4'>
          <div className='flex gap-1 rounded-lg border border-gray-200 p-1'>
            <ToggleButton
              pressed={selectedOptions.includes('option1')}
              onPressedChange={() => handleOptionChange('option1')}
              className='rounded-md'
            >
              Option 1
            </ToggleButton>
            <ToggleButton
              pressed={selectedOptions.includes('option2')}
              onPressedChange={() => handleOptionChange('option2')}
              className='rounded-md'
            >
              Option 2
            </ToggleButton>
            <ToggleButton
              pressed={selectedOptions.includes('option3')}
              onPressedChange={() => handleOptionChange('option3')}
              className='rounded-md'
            >
              Option 3
            </ToggleButton>
          </div>
          <div className='text-sm text-gray-600'>Selected: {selectedOptions.join(', ') || 'None'}</div>
        </div>
      );
    };

    return <ToggleButtonGroupComponent />;
  },
};

export const SingleSelectGroup: Story = {
  render: () => {
    const SingleSelectGroupComponent = () => {
      const [selectedOption, setSelectedOption] = useState<string>('option1');

      return (
        <div className='flex flex-col gap-4'>
          <div className='flex gap-1 rounded-lg border border-gray-200 p-1'>
            <ToggleButton
              pressed={selectedOption === 'option1'}
              onPressedChange={() => setSelectedOption('option1')}
              className='rounded-md'
            >
              Small
            </ToggleButton>
            <ToggleButton
              pressed={selectedOption === 'option2'}
              onPressedChange={() => setSelectedOption('option2')}
              className='rounded-md'
            >
              Medium
            </ToggleButton>
            <ToggleButton
              pressed={selectedOption === 'option3'}
              onPressedChange={() => setSelectedOption('option3')}
              className='rounded-md'
            >
              Large
            </ToggleButton>
          </div>
          <div className='text-sm text-gray-600'>Selected: {selectedOption}</div>
        </div>
      );
    };

    return <SingleSelectGroupComponent />;
  },
};

export const IconGroup: Story = {
  render: () => {
    const IconGroupComponent = () => {
      const [selectedIcons, setSelectedIcons] = useState<string[]>(['star']);

      const handleIconChange = (icon: string) => {
        setSelectedIcons((prev) => (prev.includes(icon) ? prev.filter((item) => item !== icon) : [...prev, icon]));
      };

      const icons = [
        { id: 'star', svg: '⭐' },
        { id: 'heart', svg: '❤️' },
        { id: 'thumbs', svg: '👍' },
        { id: 'fire', svg: '🔥' },
      ];

      return (
        <div className='flex flex-col gap-4'>
          <div className='flex gap-1 rounded-lg border border-gray-200 p-1'>
            {icons.map((icon) => (
              <ToggleButton
                key={icon.id}
                pressed={selectedIcons.includes(icon.id)}
                onPressedChange={() => handleIconChange(icon.id)}
                className='rounded-md'
              >
                {icon.svg}
              </ToggleButton>
            ))}
          </div>
          <div className='text-sm text-gray-600'>Selected: {selectedIcons.join(', ') || 'None'}</div>
        </div>
      );
    };

    return <IconGroupComponent />;
  },
};
