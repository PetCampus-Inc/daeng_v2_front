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
    <Avatar style={{ width: size, height: size }} className={className}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback>
        <Image src='/images/img_default_image.png' alt='default' width={size} height={size} />
      </AvatarFallback>
    </Avatar>
  );
}
