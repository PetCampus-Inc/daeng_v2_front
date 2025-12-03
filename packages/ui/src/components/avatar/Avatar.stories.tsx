import type { Meta, StoryObj } from '@storybook/nextjs';
import type { AvatarProps as RadixAvatarProps } from '@radix-ui/react-avatar';
import { cn } from '@knockdog/ui/lib';

import { Avatar, AvatarFallback, AvatarImage } from './Avatar';

interface AvatarStoryArgs extends RadixAvatarProps {
  imageSrc?: string;
  alt?: string;
  fallbackLabel: string;
  fallbackDelay?: number;
  size: 'sm' | 'md' | 'lg';
}

const sizeStyles: Record<AvatarStoryArgs['size'], { avatar: string; fallback: string }> = {
  sm: {
    avatar: 'h-10 w-10 text-xs',
    fallback: 'text-xs',
  },
  md: {
    avatar: 'h-15 w-15 text-sm',
    fallback: 'text-sm',
  },
  lg: {
    avatar: 'h-30 w-30 text-base',
    fallback: 'text-base',
  },
};

const meta: Meta<AvatarStoryArgs> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    size: 'md',
    fallbackLabel: 'KD',
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: '아바타 크기 프리셋',
    },
    imageSrc: {
      control: 'text',
      description: '아바타 이미지 URL',
    },
    alt: {
      control: 'text',
      description: '이미지 대체 텍스트',
    },
    fallbackLabel: {
      control: 'text',
      description: '이미지 로드 실패 시 표시될 텍스트',
    },
    fallbackDelay: {
      control: 'number',
      description: 'AvatarFallback 지연 시간(ms)',
    },
  },
};

export default meta;

type Story = StoryObj<AvatarStoryArgs>;

const renderAvatar = ({
  size,
  imageSrc,
  alt,
  fallbackLabel,
  fallbackDelay,
  className,
  ...restProps
}: AvatarStoryArgs) => (
  <Avatar className={cn(sizeStyles[size].avatar, className)} {...restProps}>
    <AvatarImage className='object-cover' src={imageSrc} alt={alt} />
    <AvatarFallback className={sizeStyles[size].fallback} delayMs={fallbackDelay}>
      {fallbackLabel}
    </AvatarFallback>
  </Avatar>
);

export const Default: Story = {
  render: renderAvatar,
};

export const WithImage: Story = {
  args: {
    imageSrc: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=128&h=128&auto=format&fit=crop&q=80&fm=webp',
    alt: 'Golden retriever running on grass',
    fallbackLabel: 'GR',
  },
  render: renderAvatar,
};

export const WithFallbackDelay: Story = {
  args: {
    fallbackDelay: 600,
  },
  render: renderAvatar,
};

export const SizeVariants: Story = {
  render: (args) => (
    <div className='flex items-center gap-4'>
      {(['sm', 'md', 'lg'] as AvatarStoryArgs['size'][]).map((size) => (
        <div key={size} className='flex flex-col items-center gap-2'>
          {renderAvatar({ ...args, size })}
          <span className='text-muted-foreground text-xs uppercase'>{size}</span>
        </div>
      ))}
    </div>
  ),
};
