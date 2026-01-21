import { Avatar, AvatarFallback, AvatarImage, Icon } from '@knockdog/ui';

export function CircleAvatar({
  size = 80,
  src,
  alt,
  className = '',
}: {
  size?: number;
  src?: string;
  alt?: string;
  className?: string;
}) {
  return (
    <Avatar style={{ width: size, height: size }} className={className}>
      <AvatarImage src={src} alt={alt} className='object-cover' />
      <AvatarFallback>
        <div className='bg-primitive-neutral-100 flex h-full w-full items-center justify-center'>
          <div style={{ width: size / 2, height: size / 2 }}>
            <Icon icon='Kindergarten' className='text-fill-neutral-100 h-full w-full' />
          </div>
        </div>
      </AvatarFallback>
    </Avatar>
  );
}
