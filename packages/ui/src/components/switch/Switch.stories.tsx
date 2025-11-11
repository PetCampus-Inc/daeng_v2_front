import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: { type: 'boolean' },
      description: 'Switch 비활성화 여부',
    },
    pressed: {
      control: { type: 'boolean' },
      description: 'Switch 활성화 상태 (controlled)',
    },
    defaultPressed: {
      control: { type: 'boolean' },
      description: 'Switch 초기 활성화 상태 (uncontrolled)',
    },
    onPressedChange: {
      action: 'pressed changed',
      description: 'Switch 상태 변경 시 호출되는 콜백',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const DefaultPressed: Story = {
  args: {
    defaultPressed: true,
  },
};

export const Controlled: Story = {
  render: function Render() {
    const [pressed, setPressed] = useState(false);

    return (
      <div className='flex flex-col gap-4'>
        <Switch pressed={pressed} onPressedChange={setPressed} />
        <div className='text-sm text-gray-600'>State: {pressed ? 'On' : 'Off'}</div>
      </div>
    );
  },
};

export const Uncontrolled: Story = {
  render: function Render() {
    const [state, setState] = useState(false);

    return (
      <div className='flex flex-col gap-4'>
        <Switch defaultPressed={false} onPressedChange={setState} />
        <div className='text-sm text-gray-600'>State: {state ? 'On' : 'Off'}</div>
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledPressed: Story = {
  args: {
    disabled: true,
    pressed: true,
  },
};

export const States: Story = {
  render: function Render() {
    const [pressed1, setPressed1] = useState(false);
    const [pressed2, setPressed2] = useState(true);

    return (
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col gap-3'>
          <div className='text-sm font-medium text-gray-700'>기본 상태</div>
          <div className='flex items-center gap-4'>
            <Switch pressed={pressed1} onPressedChange={setPressed1} />
            <span className='text-sm text-gray-600'>Off</span>
          </div>
          <div className='flex items-center gap-4'>
            <Switch pressed={pressed2} onPressedChange={setPressed2} />
            <span className='text-sm text-gray-600'>On</span>
          </div>
          <div className='flex items-center gap-4'>
            <Switch disabled />
            <span className='text-sm text-gray-600'>Disabled (Off)</span>
          </div>
          <div className='flex items-center gap-4'>
            <Switch disabled pressed />
            <span className='text-sm text-gray-600'>Disabled (On)</span>
          </div>
        </div>
        <div className='text-sm text-gray-600'>
          <div>Switch 1: {pressed1 ? 'On' : 'Off'}</div>
          <div>Switch 2: {pressed2 ? 'On' : 'Off'}</div>
        </div>
      </div>
    );
  },
};

export const WithLabel: Story = {
  render: function Render() {
    const [pressed, setPressed] = useState(false);

    return (
      <div className='flex items-center gap-3'>
        <Switch pressed={pressed} onPressedChange={setPressed} />
        <label className='cursor-pointer text-sm font-medium text-gray-700' onClick={() => setPressed(!pressed)}>
          알림 받기
        </label>
      </div>
    );
  },
};

export const MultipleSwitches: Story = {
  render: function Render() {
    const [notifications, setNotifications] = useState({
      email: false,
      sms: true,
      push: false,
    });

    const handleChange = (key: keyof typeof notifications) => {
      setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
      <div className='flex flex-col gap-4'>
        <div className='space-y-4'>
          <div className='flex items-center justify-between gap-8'>
            <label className='text-sm font-medium text-gray-700'>이메일 알림</label>
            <Switch pressed={notifications.email} onPressedChange={() => handleChange('email')} />
          </div>
          <div className='flex items-center justify-between gap-8'>
            <label className='text-sm font-medium text-gray-700'>SMS 알림</label>
            <Switch pressed={notifications.sms} onPressedChange={() => handleChange('sms')} />
          </div>
          <div className='flex items-center justify-between gap-8'>
            <label className='text-sm font-medium text-gray-700'>푸시 알림</label>
            <Switch pressed={notifications.push} onPressedChange={() => handleChange('push')} />
          </div>
        </div>
        <div className='mt-4 rounded-lg bg-gray-50 p-3'>
          <div className='text-xs font-medium text-gray-600'>현재 설정:</div>
          <div className='mt-1 text-sm text-gray-700'>
            {Object.entries(notifications)
              .filter(([, value]) => value)
              .map(([key]) => key.toUpperCase())
              .join(', ') || '없음'}
          </div>
        </div>
      </div>
    );
  },
};

export const InteractiveExample: Story = {
  render: function Render() {
    const [darkMode, setDarkMode] = useState(false);
    const [autoSave, setAutoSave] = useState(true);
    const [notifications, setNotifications] = useState(false);

    return (
      <div className='space-y-6 rounded-lg border p-6'>
        <h3 className='text-lg font-semibold text-gray-900'>설정 예시</h3>
        <div className='space-y-4'>
          <div className='flex items-center justify-between gap-8'>
            <div>
              <div className='text-sm font-medium text-gray-700'>다크 모드</div>
              <div className='text-xs text-gray-500'>시스템 테마를 다크 모드로 전환합니다</div>
            </div>
            <Switch pressed={darkMode} onPressedChange={setDarkMode} />
          </div>
          <div className='flex items-center justify-between gap-8'>
            <div>
              <div className='text-sm font-medium text-gray-700'>자동 저장</div>
              <div className='text-xs text-gray-500'>변경사항을 자동으로 저장합니다</div>
            </div>
            <Switch pressed={autoSave} onPressedChange={setAutoSave} />
          </div>
          <div className='flex items-center justify-between gap-8'>
            <div>
              <div className='text-sm font-medium text-gray-700'>알림 받기</div>
              <div className='text-xs text-gray-500'>새로운 업데이트를 알림으로 받습니다</div>
            </div>
            <Switch pressed={notifications} onPressedChange={setNotifications} />
          </div>
        </div>
      </div>
    );
  },
};
