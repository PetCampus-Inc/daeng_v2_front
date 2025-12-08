import { Avatar, AvatarFallback, AvatarImage } from '@knockdog/ui';
import Image from 'next/image';

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
    <Avatar className={`h-[${size}px] w-[${size}px] ${className}`}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback>
        <Image src='/images/img_default_image.png' alt='default' width={size} height={size} />
      </AvatarFallback>
    </Avatar>
  );
}
