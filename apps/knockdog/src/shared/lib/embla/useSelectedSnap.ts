import { useCallback, useEffect, useState } from 'react';
import type { EmblaCarouselType } from 'embla-carousel';

type UseSelectedSnapType = {
  selectedSnap: number;
  snapCount: number;
};

export function useSelectedSnap(
  emblaApi: EmblaCarouselType | undefined
): UseSelectedSnapType {
  const [selectedSnap, setSelectedSnap] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  const updateScrollSnapState = useCallback((emblaApi: EmblaCarouselType) => {
    setSnapCount(emblaApi.scrollSnapList().length);
    setSelectedSnap(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    updateScrollSnapState(emblaApi);
    emblaApi.on('select', updateScrollSnapState);
    emblaApi.on('reInit', updateScrollSnapState);
  }, [emblaApi, updateScrollSnapState]);

  return {
    selectedSnap,
    snapCount,
  };
}
