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
        <div className='flex h-full w-full items-center justify-center bg-primitive-neutral-100'>
          <Icon icon='Kindergarten' className={`text-fill-neutral-100 w-[${size/2}px] h-[${size/2}px]`} />
        </div>
      </AvatarFallback>
    </Avatar>
  );
}
