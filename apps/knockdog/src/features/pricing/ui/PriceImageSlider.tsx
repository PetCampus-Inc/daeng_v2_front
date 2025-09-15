import Image from 'next/image';

interface PriceImageSliderProps {
  images: string[];
}

function PriceImageSlider({ images }: PriceImageSliderProps) {
  return (
    <div>
      <div className='mb-3'>
        <span className='body1-bold mr-1'>가격표</span>
        <span className='text-text-accent body1-bold'>{images.length}</span>
      </div>
      <div className='scrollbar-hide flex gap-[14px] overflow-x-auto'>
        {images.map((image, index) => (
          <Image
            key={index}
            src={image}
            alt=''
            className='h-[120px] w-[120px] rounded-lg object-cover'
            width={120}
            height={120}
          />
        ))}
      </div>
    </div>
  );
}

export { PriceImageSlider };
