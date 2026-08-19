import { Icon } from '@knockdog/ui';
import Image from 'next/image';
import { cn } from '@knockdog/ui/lib';

interface DogCardProps {
  name: string;
  breed?: string;
  age?: number;
  imageUrl?: string;
  isRepresentative?: boolean;
  onClick?: () => void;
}

function DogCard({ name, breed, age, imageUrl, isRepresentative, onClick }: DogCardProps) {
  const details = [breed, age ? `${age}살` : undefined].filter(Boolean);

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative h-[200px] w-[150px] shrink-0 overflow-hidden rounded-2xl',
        !imageUrl && 'bg-neutral-800'
      )}
    >
      {imageUrl ? (
        <Image src={imageUrl} alt={name} fill className='object-cover' />
      ) : (
        <div className='flex h-full w-full items-center justify-center pb-[34px]'>
          <Icon icon='Paw' className='text-fill-secondary-600 h-[52px] w-[52px]' />
        </div>
      )}

      {/* Gradient dim overlay */}
      <div
        className='absolute inset-x-0 bottom-0 h-[80px]'
        style={{
          background: 'linear-gradient(to bottom, #00000000 0%, #000000CC 80%)',
        }}
      />

      <div className='absolute bottom-4 left-4 z-10 flex flex-col gap-y-1'>
        <div className='h3-semibold flex items-center gap-x-0.5'>
          {isRepresentative && <Icon icon='Maindog' className='text-text-accent size-5' />}
          <span className='text-text-primary-inverse'>{name}</span>
        </div>
        <div className='body2-regular text-text-primary-inverse flex max-w-[118px] items-center gap-x-1'>
          {details.map((detail, index) => (
            <span className='truncate' key={index}>
              {detail}
              {index < details.length - 1 && ' • '}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export { DogCard };
