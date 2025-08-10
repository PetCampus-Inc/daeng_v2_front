/* eslint-disable @next/next/no-img-element */
import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { CardClipDefs } from './CardClipDefs';

import { useSelectedSnap } from '@shared/lib';

interface DogSchoolImageSliderProps {
  id: string;
  name: string;
  slides: string[];
}

export function DogSchoolImageSlider(props: DogSchoolImageSliderProps) {
  const { id, name, slides } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
  });

  const { selectedSnap, snapCount } = useSelectedSnap(emblaApi);

  return (
    <section
      style={{
        clipPath: `url(#card-image-${id})`,
      }}
    >
      <div ref={emblaRef}>
        <div className='flex'>
          {slides?.map((item) => (
            <div className='relative aspect-[16/9] flex-[0_0_100%]' key={item}>
              <img src={item} alt={name} className='h-full w-full object-cover' />
            </div>
          ))}
        </div>
      </div>

      {/* 슬라이더 인디케이터 */}
      <div className='radius-r3 bg-dim-70 absolute right-2 bottom-2 inline-flex items-center gap-px px-[10px] py-[3px]'>
        <span className='caption1-regular text-text-primary-inverse'>{selectedSnap + 1}</span>
        <span className='caption1-regular text-text-primary-inverse'>/</span>
        <span className='caption1-regular text-text-primary-inverse'>{snapCount}</span>
      </div>

      {/* 카드 이미지 클리핑 */}
      <CardClipDefs id={id} />
    </section>
  );
}
